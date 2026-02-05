export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">営業日報システム</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sales Daily Report System
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Next.js {process.env.npm_package_dependencies_next}
          </p>
          <p className="text-sm text-gray-500">
            React {process.env.npm_package_dependencies_react}
          </p>
          <p className="text-sm text-gray-500">
            TypeScript {process.env.npm_package_devDependencies_typescript}
          </p>
        </div>
      </div>
    </main>
  );
}
