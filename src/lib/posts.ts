export type Category = 'Architecture' | 'Technology'

export interface Post {
  id: number
  category: Category
  access: 'Paid' | 'Free'
  date: string
  readTime: string
  title: string
  excerpt: string
  image: string
  body: string[]
}

export const posts: Post[] = [
  {
    id: 1,
    category: 'Architecture',
    access: 'Paid',
    date: 'Nov 10, 2026',
    readTime: '6 min read',
    title: 'Technology is the architecture of ideas',
    excerpt:
      'The apps we use are only the surface. A look at the logic and thinking that sit underneath them.',
    image: '/blog/architecture-of-ideas.jpg',
    body: [
      'Every app we open sits on top of decisions: how data is stored, how requests travel, and what happens when something goes wrong. Those decisions are the architecture, and they shape what the product can become.',
      'Good architecture is mostly invisible. When it works, people notice the experience and never the structure. When it fails, every small change becomes expensive.',
      'Learning to see that hidden layer is what turns a person who uses technology into a person who understands it.',
    ],
  },
  {
    id: 2,
    category: 'Technology',
    access: 'Free',
    date: 'Nov 05, 2026',
    readTime: '5 min read',
    title: 'Why understanding technology matters as much as building it',
    excerpt:
      'Curiosity and technical exploration come first. Creating is easier when you know why things work.',
    image: '/blog/human-and-machine.jpg',
    body: [
      'It is tempting to copy a solution that works and move on. But code you do not understand breaks in ways you cannot fix.',
      'Taking time to ask why a tool behaves the way it does builds judgement, and judgement is what lets you choose well when there is no tutorial to follow.',
      'Building and understanding feed each other. The more you build, the more questions you have, and the more you understand, the better you build.',
    ],
  },
  {
    id: 3,
    category: 'Technology',
    access: 'Free',
    date: 'Oct 28, 2026',
    readTime: '7 min read',
    title: 'Depth over trends: examining technology with clarity and intention',
    excerpt:
      'No superficial hype. A slower way of looking at the tools that shape how we live and work.',
    image: '/blog/depth-over-trends.jpg',
    body: [
      'Every month brings a new framework, a new model and a new promise. Chasing all of them leaves little time to get good at any.',
      'Depth means choosing a few tools and learning them well enough to know their limits. Clarity means being able to explain why you chose them.',
      'Intention is the filter: before adopting something new, ask what problem it solves for the people who will use what you build.',
    ],
  },
  {
    id: 4,
    category: 'Architecture',
    access: 'Paid',
    date: 'Oct 20, 2026',
    readTime: '8 min read',
    title: 'Designing for trust: security as part of the architecture',
    excerpt:
      'Why safe systems start at the blueprint stage and not as a patch added at the end.',
    image: '/blog/security-and-trust.jpg',
    body: [
      'Security added at the end is a patch. Security designed from the start is part of how the system thinks about users, data and permissions.',
      'That means deciding early who can see what, what is stored, and what happens when an account is misused.',
      'Trust is built slowly and lost quickly, so it deserves a place in the first sketch and not the last checklist.',
    ],
  },
  {
    id: 5,
    category: 'Architecture',
    access: 'Free',
    date: 'Oct 12, 2026',
    readTime: '4 min read',
    title: 'The teams behind the systems we build',
    excerpt:
      'Good software architecture is a team habit. Notes on collaboration, reviews and shared ownership.',
    image: '/blog/teams-behind-systems.jpg',
    body: [
      'Software is rarely built alone. The structure of a system tends to mirror the structure of the team that made it.',
      'Code reviews, shared standards and honest conversations about trade-offs keep that structure healthy.',
      'A team that owns its decisions together builds systems that are easier to understand, change and trust.',
    ],
  },
]

const KEY = 'selectedPostId'

export function selectPost(id: number) {
  try {
    sessionStorage.setItem(KEY, String(id))
  } catch {
    /* storage unavailable, fall back to the first post */
  }
}

export function getSelectedPost(): Post {
  let id = posts[0].id
  try {
    const saved = sessionStorage.getItem(KEY)
    if (saved) id = Number(saved)
  } catch {
    /* storage unavailable */
  }
  return posts.find((post) => post.id === id) ?? posts[0]
}