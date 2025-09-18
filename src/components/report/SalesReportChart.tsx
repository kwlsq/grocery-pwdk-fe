"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSalesReportStore } from "@/store/salesReportStore"
import { useEffect, useMemo } from "react"

export const description = "A line chart"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

// Helper function to generate all months for the current year
const generateMonthsForYear = (year: number) => {
  const months = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(year, i, 1)
    const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`
    const monthName = date.toLocaleString('default', { month: 'long' })

    months.push({
      month: monthName,
      monthKey,
      orderCount: 0
    })
  }
  return months
}

export function SalesReportChart() {
  const { monthlySales, fetchMonthlySales } = useSalesReportStore();

  useEffect(() => {
    // Add a small delay to prevent race condition with table component
    const timer = setTimeout(() => {
      console.log('Chart: Fetching monthly sales...')
      fetchMonthlySales();
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, [fetchMonthlySales])

  // Process the data to fill missing months
  const processedData = useMemo(() => {
    if (!monthlySales || monthlySales.length === 0) {
      // If no data, return current year with all zeros
      return generateMonthsForYear(new Date().getFullYear())
    }

    // Get the year from the first data point (assuming all data is from the same year)
    const firstDataYear = new Date(monthlySales[0].month + '-01').getFullYear()

    // Generate all months for the year
    const allMonths = generateMonthsForYear(firstDataYear)

    // Create a map for quick lookup of existing data
    const dataMap = new Map(
      monthlySales.map(item => [item.month, item.orderCount])
    )

    // Fill in the actual data
    return allMonths.map(month => ({
      month: month.month,
      monthKey: month.monthKey,
      orderCount: dataMap.get(month.monthKey) || 0
    }))
  }, [monthlySales])

  const currentYear = processedData.length > 0 ?
    new Date(processedData[0].monthKey + '-01').getFullYear() :
    new Date().getFullYear()

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Monthly Sales Report</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
        config={chartConfig}
        className="h-40 w-full"
        >
          <LineChart
            accessibilityLayer
            data={processedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                hideLabel={false}
                formatter={(value) => [
                  `${value} orders`
                ]}
                labelFormatter={(label) => `${label} ${currentYear}`}
              />}
            />
            <Line
              dataKey="orderCount"
              type="monotone"
              stroke="var(--color-sales)"
              strokeWidth={2}
              dot={{ fill: "var(--color-sales)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "var(--color-sales)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}