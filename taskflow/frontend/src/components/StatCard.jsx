const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">{title}</span>
        <span>{icon}</span>
      </div>
      <h2 className="text-2xl font-bold">{value ?? 0}</h2>
    </div>
  );
};

export default StatCard;