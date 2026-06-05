# LIFE OS v3 - Development Guide

## Project Structure

```
life-os/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── index.ts           # Server entry point
│   │   │   └── routes/            # API route handlers
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Database schema
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/         # React UI application
│       ├── src/
│       │   ├── pages/               # Page components
│       │   ├── components/          # Reusable components
│       │   ├── hooks/               # Custom React hooks
│       │   ├── store/               # Zustand stores
│       │   ├── App.tsx              # Main app component
│       │   ├── main.tsx             # Entry point
│       │   └── index.css            # Global styles
│       ├── Dockerfile
│       ├── index.html
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── docker-compose.yml
├── package.json          # Monorepo root
├── README.md
└── PRD.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Git

### Local Development Setup

1. **Clone and install**:
```bash
git clone https://github.com/Sean-steve/Life-OS.git
cd Life-OS
yarn install
```

2. **Set up environment**:
```bash
cp apps/backend/.env.example apps/backend/.env.local

# Edit .env.local:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/life_os
JWT_SECRET=dev-secret-key-change-in-production
OPENAI_API_KEY=sk-your-api-key
NODE_ENV=development
PORT=3000
```

3. **Database setup**:
```bash
# Create database
createdb life_os

# Run migrations
yarn db:migrate

# Generate Prisma client
yarn db:generate
```

4. **Start development**:
```bash
# Terminal 1: Backend
yarn workspace @life-os/backend dev

# Terminal 2: Frontend
yarn workspace @life-os/frontend dev
```

Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/health

### Docker Development

```bash
# Copy and edit environment
cp .env.example .env

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend yarn db:migrate

# View logs
docker-compose logs -f
```

## Backend Development

### Adding a New API Endpoint

1. **Create route file** (e.g., `src/routes/newfeature.ts`):
```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Your logic here
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

export default router;
```

2. **Register in `src/index.ts`**:
```typescript
import newFeatureRouter from './routes/newfeature.js';
app.use('/api/newfeature', authMiddleware, newFeatureRouter);
```

3. **Add types to Prisma schema** (if needed):
```prisma
model NewFeature {
  id    String  @id @default(cuid())
  userId String
  // ... fields
  
  user NewFeature @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

4. **Run migration**:
```bash
yarn db:migrate
yarn db:generate
```

### Testing Routes

Use Postman or curl:
```bash
# Create new item
curl -X POST http://localhost:3000/api/newfeature \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# Fetch items
curl http://localhost:3000/api/newfeature \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Development

### Adding a New Page

1. **Create component** (e.g., `src/pages/NewPage.tsx`):
```typescript
import React from 'react';
import { motion } from 'framer-motion';

const NewPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 p-8"
    >
      <h1 className="text-4xl font-bold text-white">New Page</h1>
    </motion.div>
  );
};

export default NewPage;
```

2. **Add route to `App.tsx`**:
```typescript
<Route path="/newpage" element={<NewPage />} />
```

3. **Add navigation in `Layout.tsx`**:
```typescript
const navItems = [
  // ... existing items
  { label: 'New Page', icon: SomeIcon, href: '/newpage' },
];
```

### Using React Query Hooks

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: async () => {
    const res = await api.get('/api/items');
    return res.data;
  }
});

// Mutation
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await api.post('/api/items', data);
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  }
});
```

### Using Zustand Store

```typescript
import { useUIStore } from '../store';

const MyComponent = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  
  return (
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
      Toggle Sidebar
    </button>
  );
};
```

## Database Schema

### Adding a New Table

Edit `apps/backend/prisma/schema.prisma`:

```prisma
model MyEntity {
  id        String   @id @default(cuid())
  userId    String
  title     String
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}
```

Then migrate:
```bash
yarn db:migrate
yarn db:generate
```

### Query Examples

```typescript
// Create
const item = await prisma.myEntity.create({
  data: { userId, title, status: 'active' }
});

// Read
const items = await prisma.myEntity.findMany({
  where: { userId }
});

// Update
const updated = await prisma.myEntity.update({
  where: { id },
  data: { status: 'completed' }
});

// Delete
await prisma.myEntity.delete({ where: { id } });

// Complex queries
const results = await prisma.myEntity.findMany({
  where: {
    userId,
    status: { in: ['active', 'pending'] }
  },
  include: { relatedData: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});
```

## Styling Guide

### TailwindCSS Classes

```typescript
// Containers
className="min-h-screen bg-slate-950 p-8"

// Text
className="text-4xl font-bold text-white"
className="text-sm text-slate-400"

// Cards
className="bg-slate-800 border border-slate-700 rounded-lg p-6"
className="card-hover" // custom class with hover effects

// Buttons
className="btn-primary" // blue primary button
className="btn-secondary" // slate secondary button

// Inputs
className="input-field" // styled input

// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Flexbox
className="flex items-center justify-between gap-4"

// Dark mode
className="dark:bg-slate-900 light:bg-white"
```

### Animations with Framer Motion

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.5 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

## State Management

### Zustand Stores

Define in `src/store/index.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyStore {
  value: string;
  setValue: (value: string) => void;
}

export const useMyStore = create<MyStore>(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value })
    }),
    { name: 'my-store' }
  )
);
```

Use in component:
```typescript
const { value, setValue } = useMyStore();
```

## API Integration

### Custom Hooks (React Query)

Add to `src/hooks/useApi.ts`:

```typescript
export const useMyData = () => {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      const res = await api.get('/api/mydata');
      return res.data;
    }
  });
};

export const useCreateMyData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/api/mydata', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-data'] });
    }
  });
};
```

Use in component:
```typescript
const { data, isLoading } = useMyData();
const mutation = useCreateMyData();

const handleCreate = async (data) => {
  await mutation.mutateAsync(data);
};
```

## Testing

### Backend

```bash
# Run tests
yarn workspace @life-os/backend test

# Watch mode
yarn workspace @life-os/backend test --watch
```

### Frontend

```bash
# Run tests
yarn workspace @life-os/frontend test

# Watch mode
yarn workspace @life-os/frontend test --watch
```

## Deployment

### Build for Production

```bash
# Build both apps
yarn build

# Build individual apps
yarn workspace @life-os/backend build
yarn workspace @life-os/frontend build
```

### Docker Deployment

```bash
# Build images
docker build -t life-os-backend -f apps/backend/Dockerfile .
docker build -t life-os-frontend -f apps/frontend/Dockerfile .

# Run with compose
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend)

```bash
vercel deploy
```

### Railway (Backend)

1. Connect repository to Railway
2. Set environment variables
3. Deploy automatically on push

## Debugging

### Backend

```bash
# Enable debug logging
NODE_DEBUG=* yarn workspace @life-os/backend dev

# Inspect database
psql -U postgres -d life_os
```

### Frontend

Use browser DevTools:
- React DevTools extension
- Redux DevTools extension (for Zustand stores)
- Network tab for API calls

### Common Issues

**Database connection error**:
```bash
# Check PostgreSQL is running
pg_isready -h localhost -U postgres

# Recreate database
dropdb life_os
createdb life_os
yarn db:migrate
```

**Prisma client out of sync**:
```bash
yarn db:generate
```

**Port already in use**:
```bash
# Kill process on port
lsof -i :3000 | grep -v PID | awk '{print $2}' | xargs kill -9
```

## Git Workflow

### Branch naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit messages
```
feat: Add mission creation feature
fix: Resolve KPI calculation bug
docs: Update README
refactor: Simplify store logic
```

### Creating a PR
1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: Add feature"`
3. Push branch: `git push origin feature/my-feature`
4. Create PR with description
5. Request review
6. Merge after approval

## Performance Tips

### Backend
- Use database indexes
- Paginate large queries
- Cache frequently accessed data
- Batch operations where possible

### Frontend
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images
- Use suspense for async operations

## Security

### Environment Variables
- Never commit `.env` files
- Use `.env.example` for templates
- Rotate JWT secrets in production
- Use environment-specific secrets

### Authentication
- JWT tokens expire after 7 days
- Sessions stored in database
- Passwords hashed with bcrypt
- CORS configured properly

### API Security
- All endpoints require authentication
- Validate input with Zod
- Rate limiting on sensitive endpoints
- SQL injection prevention via Prisma

## Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Build the life you intend.**
