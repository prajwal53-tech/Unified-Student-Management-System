import { Card, CardContent } from "@/components/ui/card";

function StatCard({
  title,
  value,
  icon,
  color = "text-blue-600",
}) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300">

      <CardContent className="flex justify-between items-center p-6">

        <div>

          <p className="text-gray-500">
            {title}
          </p>

          <h1 className="text-3xl font-bold mt-2">
            {value}
          </h1>

        </div>

        <div className={color}>
          {icon}
        </div>

      </CardContent>

    </Card>
  );
}

export default StatCard;