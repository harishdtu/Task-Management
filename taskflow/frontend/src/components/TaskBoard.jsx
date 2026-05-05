import api from "../utils/api";

const statuses = ["todo", "in-progress", "done"];

export default function TaskBoard({ tasks, onUpdated }) {

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    onUpdated();
  };

  return (
    <div className="grid grid-cols-3 gap-4">

      {statuses.map(status => (
        <div key={status} className="bg-white/10 p-4 rounded-xl">

          <h3 className="font-bold mb-3 capitalize">{status}</h3>

          {tasks
            .filter(t => t.status === status)
            .map(task => (
              <div key={task._id} className="bg-black/30 p-3 rounded mb-2">

                <p className="font-semibold">{task.title}</p>
                <p className="text-xs text-gray-300">{task.priority}</p>

                {/* Status buttons */}
                <div className="flex gap-2 mt-2">
                  {statuses.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(task._id, s)}
                      className={`text-xs px-2 py-1 rounded ${
                        s === task.status
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

              </div>
            ))}
        </div>
      ))}

    </div>
  );
}