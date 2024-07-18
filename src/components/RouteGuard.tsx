"use client";

function RouteGuard({ userId, children }: { userId: string, children: React.ReactNode }) {

  if (!userId) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center gap-1 px-12 pt-12 pb-1 w-full">
            <div
                className="font-medium text-3xl text-slate-800"
                style={{
                    background: "linear-gradient(to right, #6a1b9a, #da77f2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                Commonwealth.ai
            </div>
            <div className="text-slate-500 font-normal">
                <strong>instantly</strong> transform political media into <strong>structured data</strong>. 
            </div>
            <p className="mt-8">Please log in to access the content.</p>
        </div>
      </div>
    )
  }

  return children;
}

export default RouteGuard;