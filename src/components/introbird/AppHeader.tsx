// src/components/introbird/AppHeader.tsx
import type { FC } from 'react';

interface AppHeaderProps {}

const AppHeader: FC<AppHeaderProps> = () => {
  return (
    <header className="py-8 text-center">
      <h1 className="font-headline text-5xl font-bold text-primary">IntroBird</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        AI-powered email replies, simplified.
      </p>
    </header>
  );
};

export default AppHeader;
