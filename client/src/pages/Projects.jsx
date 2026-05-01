import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', { 
        name: projectName, 
        description: projectDesc,
        members: selectedMembers 
      });
      setShowModal(false);
      setProjectName('');
      setProjectDesc('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/projects/${selectedProject._id}/members`, { email: memberEmail });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        {user.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project._id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-4 h-12 overflow-hidden">{project.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {project.members.length} members
              </div>
              {user.role === 'Admin' && (
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowMemberModal(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Add Member
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project Name"
                className="w-full p-2 border rounded mb-4"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded mb-4"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {allUsers.filter(u => u._id !== user._id).map(u => (
                    <div key={u._id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`user-${u._id}`}
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                        className="mr-2"
                      />
                      <label htmlFor={`user-${u._id}`} className="text-sm">{u.name} ({u.email})</label>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {selectedMembers.length} members selected
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Member to {selectedProject.name}</h2>
            <form onSubmit={handleAddMember}>
              <input
                type="email"
                placeholder="User Email"
                className="w-full p-2 border rounded mb-4"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
              />
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
