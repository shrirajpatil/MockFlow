import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Workflows',
    robots: { index: false, follow: false },
};

export default function WorkflowsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
