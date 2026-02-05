import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">営業日報システム</h1>
        <p className="text-xl text-muted-foreground mb-2">
          Sales Daily Report System
        </p>
        <p className="text-sm text-muted-foreground">
          Powered by Next.js 16, React 19, TypeScript, Tailwind CSS & shadcn/ui
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
            <CardDescription>
              Various button styles with Tailwind CSS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields with labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="山田太郎" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Submit</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Toggle</CardTitle>
            <CardDescription>
              Dark mode is enabled with next-themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the theme toggle button in the top right corner to switch
              between light, dark, and system themes.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All components are ready: Button, Input, Card, Dialog, Table, Form,
          Select, Textarea
        </p>
      </div>
    </main>
  );
}
