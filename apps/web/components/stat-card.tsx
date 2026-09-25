import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#components/ui/card'

export interface StatCardProps {
  title: string
  value: number | string
  description?: string
  trend?: string
}

export function StatCard({ title, value, description, trend }: StatCardProps) {
  return (
    <Card className="shadow-xs transition-colors">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="font-mono text-3xl font-semibold tracking-tight text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        {trend && (
          <div className="text-[11px] font-medium text-muted-foreground">
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
