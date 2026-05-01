import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Calendar } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // New Task State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    dueDate: '',
    status: 'To Do',
  });
  const [users, setUsers] = useState([]); // Simplified: in real app, fetch members of selected project

  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [filterProject, filterStatus]);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks', {
        params: { projectId: filterProject, status: filterStatus }
      });
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const handleProjectChange = (projectId) => {
    const selectedProj = projects.find((p) => p._id === projectId);
    setNewTask({ ...newTask, projectId, assignedTo: '' });
    setUsers(selectedProj ? selectedProj.members : []);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '', status: 'To Do' });
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      alert('Error deleting task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="flex items-center bg-white border rounded-md px-3 py-1">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <select 
              className="outline-none text-sm"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex items-center bg-white border rounded-md px-3 py-1">
            <select 
              className="outline-none text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {user.role === 'Admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" /> New Task
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-medium text-indigo-600">{task.title}</span>
                  <span className="text-sm text-gray-500">{task.projectId?.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className={`text-xs font-semibold rounded-full px-2 py-1 outline-none ${getStatusColor(task.status)}`}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-400">Assigned to: {task.assignedTo?.name}</div>
                {user.role === 'Admin' && (
                  <button 
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Delete Task
                  </button>
                )}
              </div>
            </li>
          ))}
          {tasks.length === 0 && <li className="p-8 text-center text-gray-500">No tasks found</li>}
        </ul>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task Title"
                  className="w-full p-2 border rounded"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newTask.projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  required
                  disabled={!newTask.projectId}
                >
                  <option value="">Assign To</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
