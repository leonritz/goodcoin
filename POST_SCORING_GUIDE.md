# Post Scoring & Ranking System

## 📊 Overview

Posts in the feed are automatically ranked using a scoring algorithm that considers:
- **Engagement** (likes + comments)
- **Quality** (flags reduce score)
- **Freshness** (newer posts rank higher)

This creates a "Hot" feed similar to Reddit or Hacker News.

---

## 🧮 The Algorithm

### Formula

```
score = (engagement - quality_penalty) / time_decay

Where:
- engagement = likes + (comments × 2)
- quality_penalty = flags × 5
- time_decay = (hours_old + 2) ^ 1.5
```

### Why This Works

1. **Comments Weighted 2x**
   - Comments show deeper engagement than likes
   - A discussion is more valuable than a simple like

2. **Flags Heavily Penalize (5x)**
   - Each flag reduces score by 5 points
   - 3 flags = -15 points (significant impact)
   - Bad content sinks quickly

3. **Time Decay (Exponential)**
   - Exponent of 1.5 = moderate decay
   - Not too fast (posts survive a few hours)
   - Not too slow (feed stays fresh)

4. **Grace Period (+2 hours)**
   - Prevents brand new posts from having score infinity
   - Gives new posts a boost without dominating

---

## 📈 Examples

### Example 1: Popular Recent Post
```
Post: 2 hours old
Likes: 10
Comments: 5  
Flags: 0

Engagement = 10 + (5 × 2) = 20
Penalty = 0 × 5 = 0
Base Score = 20 - 0 = 20
Time Decay = (2 + 2)^1.5 = 8
Final Score = 20 / 8 = 2.5
```

### Example 2: Old Popular Post
```
Post: 24 hours old
Likes: 50
Comments: 20
Flags: 1

Engagement = 50 + (20 × 2) = 90
Penalty = 1 × 5 = 5
Base Score = 90 - 5 = 85
Time Decay = (24 + 2)^1.5 = 132.6
Final Score = 85 / 132.6 = 0.64
```

### Example 3: Flagged Post
```
Post: 1 hour old
Likes: 5
Comments: 2
Flags: 3

Engagement = 5 + (2 × 2) = 9
Penalty = 3 × 5 = 15
Base Score = 9 - 15 = -6
Time Decay = (1 + 2)^1.5 = 5.2
Final Score = -6 / 5.2 = -1.15 (sinks to bottom)
```

### Example 4: Brand New Post
```
Post: 0 hours old
Likes: 1
Comments: 0
Flags: 0

Engagement = 1 + (0 × 2) = 1
Penalty = 0 × 5 = 0
Base Score = 1 - 0 = 1
Time Decay = (0 + 2)^1.5 = 2.8
Final Score = 1 / 2.8 = 0.36
```

---

## 🎯 Scoring Ranges

| Score | Interpretation |
|-------|---------------|
| > 2.0 | Very hot! Recent + very popular |
| 1.0 - 2.0 | Hot, trending post |
| 0.5 - 1.0 | Moderate engagement |
| 0.1 - 0.5 | Low engagement or aging |
| < 0 | Flagged/poor quality |

---

## ⚙️ Configuration

You can adjust the algorithm in `lib/postScoring.ts`:

```typescript
export const SCORING_CONFIG = {
  // Weight for comments (default: 2)
  commentWeight: 2,
  
  // Penalty for flags (default: 5)
  flagPenalty: 5,
  
  // Time decay speed (default: 1.5)
  // 1.0 = linear, 1.5 = moderate, 2.0 = aggressive
  timeDecayExponent: 1.5,
  
  // Grace period for new posts (default: 2 hours)
  gracePeriodHours: 2,
};
```

### Tuning Tips

**Want comments to matter more?**
```typescript
commentWeight: 3  // Comments now worth 3x likes
```

**Want stricter moderation?**
```typescript
flagPenalty: 10  // Flags hurt twice as much
```

**Want fresher feed?**
```typescript
timeDecayExponent: 2.0  // Posts age faster
```

**Want posts to last longer?**
```typescript
timeDecayExponent: 1.0  // Slower decay
gracePeriodHours: 1     // Less boost for new posts
```

---

## 🧪 Testing the Algorithm

Use the debug function to see scoring details:

```typescript
import { getScoreBreakdown } from '@/lib/postScoring';

const breakdown = getScoreBreakdown(post);
console.log(breakdown);

// Output:
{
  score: 2.5,
  engagement: 20,
  flagPenalty: 0,
  baseScore: 20,
  ageInHours: 2.5,
  timeDecay: 9.88
}
```

---

## 📊 How Posts Move Through the Feed

### Timeline of a Typical Post

```
0-1 hours:   🔥 High score (grace period boost)
1-6 hours:   📈 Peak if getting engagement
6-12 hours:  📉 Starts declining even with engagement
12-24 hours: ⬇️ Significant decay
24+ hours:   💤 Very low score unless extremely popular
```

### Effect of Engagement

```
+1 like:     Adds 1 to base score
+1 comment:  Adds 2 to base score
+1 flag:     Removes 5 from base score
```

---

## 🎮 Real-World Scenarios

### Scenario 1: Morning Post
```
8am:  Post created (score: 0.5)
9am:  5 likes, 2 comments (score: 2.2) ⬆️
12pm: 15 likes, 8 comments (score: 3.1) ⬆️
6pm:  20 likes, 10 comments (score: 1.2) ⬇️
Next day: (score: 0.3) 💤
```

### Scenario 2: Viral Post
```
Posted: (score: 0.5)
1h: 50 likes, 20 comments (score: 18.6) 🚀
2h: 100 likes, 40 comments (score: 22.5) 🚀
4h: Still high score despite age
```

### Scenario 3: Controversial Post
```
Posted: (score: 0.5)
1h: 10 likes, 5 comments, 2 flags (score: 0.83)
2h: 15 likes, 8 comments, 5 flags (score: -0.77) ⬇️
Sinks to bottom of feed
```

---

## 🔧 Implementation Details

### Where It's Used

1. **Feed Component** (`components/Feed.tsx`)
   - Sorts all posts before display
   - Runs on every feed load

2. **Post Loading** (`loadFeed()`)
   - Fetches all posts
   - Applies scoring
   - Sorts by score (highest first)

### Performance

- ⚡ **Fast**: O(n log n) complexity (just sorting)
- 💾 **No DB changes**: Calculated on-the-fly
- 🔄 **Real-time**: Score updates on every reload

### Caching Considerations

Currently, scores are calculated fresh every time. For optimization:

```typescript
// Option: Cache scores for 5 minutes
// Add to Post model:
cachedScore: number;
scoreCalculatedAt: Date;

// Then in scoring:
if (Date.now() - scoreCalculatedAt < 5 * 60 * 1000) {
  return cachedScore;
}
```

---

## 🎨 UI Indicators (Optional Future Feature)

You could add visual indicators:

```typescript
const getPostBadge = (score: number) => {
  if (score > 5) return { emoji: '🔥', text: 'HOT' };
  if (score > 2) return { emoji: '📈', text: 'Trending' };
  if (score < 0) return { emoji: '⚠️', text: 'Flagged' };
  return null;
};
```

---

## 📚 Alternatives & Comparisons

### Reddit's "Hot" Algorithm
```
Similar approach, uses log scale for votes
More complex time decay
```

### Hacker News Ranking
```
Simpler: points / (age + 2)^1.8
No comment weighting
Heavier time decay
```

### Our Algorithm
```
Balanced for social content
Comments valued (conversations)
Flags integrated (quality control)
Moderate decay (posts last hours)
```

---

## 🚀 Future Enhancements

### 1. Personalization
```typescript
// Boost posts from users you interact with
if (userHasInteractedWith(post.creatorFid)) {
  score *= 1.5;
}
```

### 2. Topic Boosting
```typescript
// Boost certain types of content
if (post.hashtags.includes('announcement')) {
  score *= 2;
}
```

### 3. User Reputation
```typescript
// Trust some users more
const creatorRep = getUserReputation(post.creatorFid);
score *= (1 + creatorRep * 0.1);
```

### 4. A/B Testing
```typescript
// Test different decay rates
const decayRate = userInExperiment('fast_decay') ? 2.0 : 1.5;
```

---

## 🐛 Troubleshooting

### Posts Not Sorting
- Check console for errors
- Verify `flagCount` is being loaded
- Check post `createdAt` is valid

### Old Posts Ranking Too High
- Increase `timeDecayExponent` (try 2.0)
- Reduce `gracePeriodHours` (try 1)

### New Posts Dominating
- Decrease `timeDecayExponent` (try 1.0)
- Increase `gracePeriodHours` (try 3)

### Flags Not Working
- Increase `flagPenalty` (try 10)
- Check flags are being counted correctly

---

## 📊 Analytics Queries

### Find Top Scoring Posts
```typescript
const topPosts = getTopPosts(allPosts, 10);
```

### See Score Distribution
```typescript
const scores = posts.map(p => calculatePostScore(p));
const avg = scores.reduce((a,b) => a+b) / scores.length;
console.log(`Average score: ${avg}`);
```

### Identify Outliers
```typescript
posts.forEach(post => {
  const breakdown = getScoreBreakdown(post);
  if (breakdown.score > 10) {
    console.log('Viral post:', post.id, breakdown);
  }
});
```

---

## ✅ Summary

**Algorithm:** `(likes + comments×2 - flags×5) / (hours_old + 2)^1.5`

**Effect:**
- ✅ Popular recent posts rank highest
- ✅ Comments valued more than likes
- ✅ Flags significantly reduce ranking
- ✅ Feed stays fresh (time decay)
- ✅ New posts get fair chance (grace period)

**Customizable:**
- Adjust weights in `SCORING_CONFIG`
- Add personalization
- Integrate with other signals

**Status: Active in Feed** 🎉

Your posts are now ranked intelligently!

