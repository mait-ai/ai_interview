// Fallback question bank used by the offline "Simulation Engine" (demo mode)
// and whenever an LLM call fails. Each item carries keywords used by the
// heuristic evaluator to judge answer relevance/accuracy.

export const QUESTION_BANK = [
  // ---------------- JavaScript ----------------
  { topic: 'javascript', category: 'Technical', difficulty: 1, q: 'What is the difference between `let`, `const` and `var` in JavaScript?', keywords: ['scope', 'block', 'function', 'hoisting', 'reassign', 'const', 'let', 'var', 'tdz'] },
  { topic: 'javascript', category: 'Technical', difficulty: 2, q: 'Explain the event loop and how asynchronous callbacks, promises and the microtask queue interact.', keywords: ['event loop', 'callback', 'queue', 'microtask', 'macrotask', 'promise', 'stack', 'async', 'non-blocking'] },
  { topic: 'javascript', category: 'Technical', difficulty: 3, q: 'How would you implement a debounce function, and when would you prefer throttle instead?', keywords: ['debounce', 'throttle', 'timer', 'settimeout', 'closure', 'leading', 'trailing', 'rate', 'performance'] },

  // ---------------- React ----------------
  { topic: 'react', category: 'Technical', difficulty: 1, q: 'What are React components and props, and how does data flow between them?', keywords: ['component', 'props', 'unidirectional', 'parent', 'child', 'render', 'reusable', 'state'] },
  { topic: 'react', category: 'Technical', difficulty: 2, q: 'Explain the rules of hooks and what problems `useEffect` dependency arrays solve.', keywords: ['hook', 'useeffect', 'dependency', 'render', 'cleanup', 'state', 'side effect', 'rerender', 'stale'] },
  { topic: 'react', category: 'Technical', difficulty: 3, q: 'How would you diagnose and fix unnecessary re-renders in a large React app?', keywords: ['memo', 'usememo', 'usecallback', 'rerender', 'profiler', 'key', 'reconciliation', 'context', 'virtualization'] },

  // ---------------- Python ----------------
  { topic: 'python', category: 'Technical', difficulty: 1, q: 'What is the difference between a list and a tuple in Python, and when would you use each?', keywords: ['list', 'tuple', 'mutable', 'immutable', 'hashable', 'performance', 'index'] },
  { topic: 'python', category: 'Technical', difficulty: 2, q: 'Explain list comprehensions and generators, and the memory trade-offs between them.', keywords: ['comprehension', 'generator', 'yield', 'lazy', 'memory', 'iterator', 'eager'] },
  { topic: 'python', category: 'Technical', difficulty: 3, q: 'What is the GIL, and how does it affect CPU-bound vs IO-bound concurrency in Python?', keywords: ['gil', 'thread', 'process', 'cpu', 'io', 'multiprocessing', 'asyncio', 'concurrency', 'parallel'] },

  // ---------------- Data structures ----------------
  { topic: 'datastructures', category: 'Technical', difficulty: 1, q: 'When would you choose a hash map over an array, and what are the trade-offs?', keywords: ['hash', 'map', 'array', 'lookup', 'o(1)', 'collision', 'order', 'index', 'key'] },
  { topic: 'datastructures', category: 'Technical', difficulty: 2, q: 'Compare a stack and a queue and give a real-world use case for each.', keywords: ['stack', 'queue', 'lifo', 'fifo', 'push', 'pop', 'enqueue', 'undo', 'bfs'] },
  { topic: 'datastructures', category: 'Technical', difficulty: 3, q: 'How would you detect a cycle in a linked list, and what is the time/space complexity?', keywords: ['cycle', 'linked list', 'floyd', 'slow', 'fast', 'pointer', 'o(n)', 'o(1)', 'tortoise'] },

  // ---------------- Algorithms ----------------
  { topic: 'algorithms', category: 'Technical', difficulty: 1, q: 'Explain Big-O notation and give the complexity of linear vs binary search.', keywords: ['big-o', 'linear', 'binary', 'log', 'o(n)', 'sorted', 'complexity', 'worst'] },
  { topic: 'algorithms', category: 'Technical', difficulty: 2, q: 'Describe how you would find duplicates in an array efficiently and analyse the complexity.', keywords: ['duplicate', 'set', 'hash', 'sort', 'o(n)', 'space', 'time', 'frequency'] },
  { topic: 'algorithms', category: 'Technical', difficulty: 3, q: 'Walk through a dynamic-programming approach to a problem of your choice and explain the recurrence.', keywords: ['dynamic', 'programming', 'memoization', 'subproblem', 'recurrence', 'optimal', 'tabulation', 'overlap'] },

  // ---------------- SQL / databases ----------------
  { topic: 'sql', category: 'Technical', difficulty: 1, q: 'What is the difference between an INNER JOIN and a LEFT JOIN?', keywords: ['inner', 'left', 'join', 'match', 'null', 'rows', 'table', 'foreign'] },
  { topic: 'sql', category: 'Technical', difficulty: 2, q: 'How do database indexes work, and what are the costs of adding one?', keywords: ['index', 'b-tree', 'lookup', 'write', 'read', 'storage', 'query', 'scan', 'performance'] },
  { topic: 'sql', category: 'Technical', difficulty: 3, q: 'Explain ACID properties and how transaction isolation levels prevent anomalies.', keywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'dirty read', 'lock', 'level'] },

  // ---------------- System design ----------------
  { topic: 'systemdesign', category: 'Scenario', difficulty: 2, q: 'How would you design a URL shortener that scales to millions of links?', keywords: ['hash', 'database', 'cache', 'scale', 'redirect', 'collision', 'load balancer', 'shard', 'base62'] },
  { topic: 'systemdesign', category: 'Scenario', difficulty: 3, q: 'Design a rate limiter for a public API. What algorithm and storage would you use and why?', keywords: ['rate', 'limit', 'token bucket', 'leaky', 'sliding window', 'redis', 'distributed', 'throttle', 'counter'] },
  { topic: 'systemdesign', category: 'Scenario', difficulty: 3, q: 'A service is slow under load. Walk me through how you would investigate and scale it.', keywords: ['latency', 'profiling', 'bottleneck', 'cache', 'horizontal', 'vertical', 'database', 'queue', 'monitoring', 'load'] },

  // ---------------- OOP ----------------
  { topic: 'oop', category: 'Conceptual', difficulty: 1, q: 'Explain the four pillars of object-oriented programming with a short example of each.', keywords: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'object', 'method'] },
  { topic: 'oop', category: 'Conceptual', difficulty: 2, q: 'What is the difference between composition and inheritance, and when do you favour composition?', keywords: ['composition', 'inheritance', 'coupling', 'reuse', 'has-a', 'is-a', 'flexible', 'fragile'] },

  // ---------------- OS ----------------
  { topic: 'os', category: 'Conceptual', difficulty: 2, q: 'What is the difference between a process and a thread, and how do they share memory?', keywords: ['process', 'thread', 'memory', 'context switch', 'shared', 'isolation', 'scheduler', 'stack'] },
  { topic: 'os', category: 'Conceptual', difficulty: 3, q: 'Explain how a deadlock occurs and the conditions required to prevent it.', keywords: ['deadlock', 'mutual exclusion', 'hold', 'wait', 'preemption', 'circular', 'lock', 'resource'] },

  // ---------------- Networking ----------------
  { topic: 'networking', category: 'Conceptual', difficulty: 1, q: 'What happens, step by step, when you type a URL into a browser and press Enter?', keywords: ['dns', 'tcp', 'http', 'request', 'response', 'render', 'handshake', 'ip', 'server'] },
  { topic: 'networking', category: 'Conceptual', difficulty: 2, q: 'Compare TCP and UDP and describe a use case where you would choose UDP.', keywords: ['tcp', 'udp', 'reliable', 'connection', 'packet', 'ordering', 'streaming', 'handshake', 'latency'] },

  // ---------------- Git ----------------
  { topic: 'git', category: 'Technical', difficulty: 1, q: 'What is the difference between `git merge` and `git rebase`?', keywords: ['merge', 'rebase', 'history', 'commit', 'branch', 'linear', 'conflict', 'fast-forward'] },

  // ---------------- Testing ----------------
  { topic: 'testing', category: 'Conceptual', difficulty: 2, q: 'Describe the testing pyramid and the role of unit, integration and end-to-end tests.', keywords: ['unit', 'integration', 'end-to-end', 'pyramid', 'mock', 'coverage', 'fast', 'brittle'] },

  // ---------------- API ----------------
  { topic: 'api', category: 'Technical', difficulty: 2, q: 'What makes a REST API well-designed? Discuss verbs, status codes and idempotency.', keywords: ['rest', 'http', 'verb', 'status', 'idempotent', 'resource', 'stateless', 'endpoint', 'get', 'post'] },

  // ---------------- Cloud ----------------
  { topic: 'cloud', category: 'Conceptual', difficulty: 2, q: 'Explain horizontal vs vertical scaling and when you would use each in the cloud.', keywords: ['horizontal', 'vertical', 'scale', 'instance', 'load balancer', 'auto', 'cost', 'stateless'] },

  // ---------------- ML ----------------
  { topic: 'ml', category: 'Conceptual', difficulty: 2, q: 'What is overfitting, how do you detect it and what techniques reduce it?', keywords: ['overfit', 'regularization', 'validation', 'dropout', 'generalize', 'variance', 'train', 'test', 'cross'] },

  // ---------------- Behavioral (role-agnostic) ----------------
  { topic: 'general', category: 'Behavioral', difficulty: 1, q: 'Tell me about a challenging project you worked on. What was your specific role and the outcome?', keywords: ['project', 'role', 'challenge', 'outcome', 'team', 'result', 'learn', 'impact', 'responsibility'] },
  { topic: 'general', category: 'Behavioral', difficulty: 2, q: 'Describe a time you disagreed with a teammate. How did you resolve it?', keywords: ['disagree', 'conflict', 'communication', 'resolve', 'compromise', 'listen', 'outcome', 'team'] },
  { topic: 'general', category: 'Behavioral', difficulty: 2, q: 'Tell me about a time you received tough feedback. How did you respond and what changed?', keywords: ['feedback', 'improve', 'reflect', 'action', 'growth', 'change', 'learn'] },
  { topic: 'general', category: 'Behavioral', difficulty: 3, q: 'Describe a situation where you had to deliver under a tight deadline with incomplete information. What did you do?', keywords: ['deadline', 'priorit', 'decision', 'risk', 'assumption', 'communicate', 'deliver', 'trade-off'] },

  // ---------------- Conceptual / general technical ----------------
  { topic: 'general', category: 'Conceptual', difficulty: 1, q: 'How do you approach debugging a problem you have never seen before?', keywords: ['reproduce', 'isolate', 'log', 'hypothesis', 'test', 'narrow', 'root cause', 'systematic'] },
  { topic: 'general', category: 'Conceptual', difficulty: 2, q: 'How do you decide between shipping fast and writing clean, maintainable code?', keywords: ['trade-off', 'technical debt', 'maintain', 'deadline', 'quality', 'refactor', 'priorit', 'context'] },
  { topic: 'general', category: 'Scenario', difficulty: 2, q: 'You are handed a large unfamiliar codebase and asked to add a feature. Walk me through your first week.', keywords: ['read', 'understand', 'architecture', 'tests', 'small', 'document', 'ask', 'incremental', 'review'] },
]

// All topics present in the bank — used to map detected skills to questions.
export const SKILL_TO_TOPIC = {
  javascript: 'javascript', js: 'javascript', typescript: 'javascript', ts: 'javascript', node: 'javascript', 'node.js': 'javascript', express: 'javascript',
  react: 'react', 'react.js': 'react', nextjs: 'react', 'next.js': 'react', redux: 'react', frontend: 'react',
  python: 'python', django: 'python', flask: 'python', pandas: 'python', numpy: 'python', fastapi: 'python',
  'data structures': 'datastructures', dsa: 'datastructures', datastructures: 'datastructures',
  algorithms: 'algorithms', algorithm: 'algorithms', leetcode: 'algorithms',
  sql: 'sql', mysql: 'sql', postgresql: 'sql', postgres: 'sql', database: 'sql', databases: 'sql', mongodb: 'sql',
  'system design': 'systemdesign', systemdesign: 'systemdesign', architecture: 'systemdesign', microservices: 'systemdesign', scalability: 'systemdesign',
  oop: 'oop', java: 'oop', 'c++': 'oop', cpp: 'oop',
  os: 'os', 'operating systems': 'os', linux: 'os',
  networking: 'networking', network: 'networking', http: 'networking', tcp: 'networking',
  git: 'git', github: 'git',
  testing: 'testing', jest: 'testing', pytest: 'testing', qa: 'testing',
  api: 'api', rest: 'api', graphql: 'api',
  cloud: 'cloud', aws: 'cloud', azure: 'cloud', gcp: 'cloud', docker: 'cloud', kubernetes: 'cloud', devops: 'cloud',
  ml: 'ml', 'machine learning': 'ml', tensorflow: 'ml', pytorch: 'ml', 'deep learning': 'ml', ai: 'ml',
}
