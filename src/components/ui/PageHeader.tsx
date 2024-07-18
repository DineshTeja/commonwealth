import { type ReactNode } from "react"

export default function PageHeader({
  icon,
  title,
  topLeft = [],
  topRight = [],
  bottomLeft = [],
  bottomRight = [],
  filterChips = null,
}: {
  icon: React.ReactNode
  title: string
  topLeft?: React.ReactNode[]
  topRight?: React.ReactNode[]
  bottomLeft?: React.ReactNode[]
  bottomRight?: React.ReactNode[]
  filterChips?: React.ReactNode
}): ReactNode {
  return (
    <>
      <div className="flex justify-between items-center w-full mb-8">
        <div className="inline-flex items-center text-2xl font-bold gap-2">
          {icon}
          <h1>{title}</h1>
          {topLeft.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {topRight.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mb-2">
        <div className="flex flex-wrap items-center gap-2">
          {bottomLeft.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bottomRight.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">{filterChips}</div>
    </>
  )
}
