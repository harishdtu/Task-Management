import { PieChart, Pie, Cell } from 'recharts';

const data = byStatus.map(s => ({
  name: s._id,
  value: s.count
}));

<PieChart width={200} height={200}>
  <Pie data={data} dataKey="value" outerRadius={80}>
    {data.map((_, i) => (
      <Cell key={i} />
    ))}
  </Pie>
</PieChart>