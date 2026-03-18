import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove, where } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost, BlogComment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Tag, ArrowRight, Plus, X, Heart, Edit, Trash2, UserPlus, Check, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

import { useAuth } from '../App';

export default function BlogPage() {
  const { user, profile } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tutorials',
    content: '',
    imageUrl: ''
  });
  const [connections, setConnections] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, BlogComment[]>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      if (user) {
        const q = query(collection(db, 'connections'), where('users', 'array-contains', user.uid));
        const snap = await getDocs(q);
        const connectedUids = snap.docs.flatMap(doc => doc.data().users).filter(uid => uid !== user.uid);
        setConnections(connectedUids);
      }
    };
    fetchConnections();
  }, [user]);

  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const blogsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setBlogs(blogsData);
      
      // Fetch comments for all blogs
      const commentsQ = query(collection(db, 'blog_comments'), orderBy('createdAt', 'asc'));
      const commentsSnap = await getDocs(commentsQ);
      const allComments = commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogComment));
      
      const commentsMap: Record<string, BlogComment[]> = {};
      allComments.forEach(comment => {
        if (!commentsMap[comment.blogId]) {
          commentsMap[comment.blogId] = [];
        }
        commentsMap[comment.blogId].push(comment);
      });
      setComments(commentsMap);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'blogs', isEditing), {
          ...formData,
        });
      } else {
        await addDoc(collection(db, 'blogs'), {
          ...formData,
          author: profile.name,
          authorId: user.uid,
          createdAt: serverTimestamp(),
          likes: []
        });
      }
      setIsAdding(false);
      setIsEditing(null);
      setFormData({ title: '', category: 'Tutorials', content: '', imageUrl: '' });
      fetchBlogs();
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'blogs', id));
        fetchBlogs();
      } catch (err) {
        console.error("Error deleting blog:", err);
      }
    }
  };

  const handleLike = async (blog: BlogPost) => {
    if (!user) return;
    const blogRef = doc(db, 'blogs', blog.id);
    const isLiked = blog.likes?.includes(user.uid);

    try {
      await updateDoc(blogRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      fetchBlogs();
    } catch (err) {
      console.error("Error liking blog:", err);
    }
  };

  const handleConnect = async (targetUid: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'connections'), {
        users: [user.uid, targetUid],
        status: 'accepted', // Auto-accept for simplicity in this demo
        createdAt: serverTimestamp()
      });
      setConnections([...connections, targetUid]);
    } catch (err) {
      console.error("Error connecting:", err);
    }
  };

  const handleAddComment = async (blogId: string) => {
    if (!user || !profile || !commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const commentData = {
        blogId,
        authorId: user.uid,
        authorName: profile.name,
        content: commentText.trim(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'blog_comments'), commentData);
      
      const newComment: BlogComment = {
        id: docRef.id,
        ...commentData,
        createdAt: { toDate: () => new Date() } // Local optimistic update
      };

      setComments(prev => ({
        ...prev,
        [blogId]: [...(prev[blogId] || []), newComment]
      }));
      
      setCommentText('');
      setActiveCommentBox(null);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Club Blog</h2>
          <p className="text-gray-600 text-lg">Tutorials, event recaps, and insights from the GFG RIT community.</p>
        </div>
        {user && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
          >
            <Plus size={20} /> Create Post
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{isEditing ? 'Edit Post' : 'Create New Post'}</h3>
                <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {['Tutorials', 'Event Recaps', 'Interview Prep', 'Campus News', 'Tech Trends'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                  <textarea 
                    required
                    rows={8}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all">
                  {isEditing ? 'Update Post' : 'Publish Post'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {blogs.length > 0 ? blogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden hover:shadow-xl transition-all"
            >
              {blog.imageUrl && (
                <div className="h-64 overflow-hidden">
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-green-600" />
                      <span className="font-medium">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-green-600" />
                      {blog.createdAt?.toDate ? format(blog.createdAt.toDate(), 'PPP') : 'Recently'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-600" />
                      {blog.category}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user && user.uid !== blog.authorId && (
                      <button 
                        onClick={() => handleConnect(blog.authorId)}
                        disabled={connections.includes(blog.authorId)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${connections.includes(blog.authorId) ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      >
                        {connections.includes(blog.authorId) ? <><Check size={14} /> Connected</> : <><UserPlus size={14} /> Connect</>}
                      </button>
                    )}
                    {user && user.uid === blog.authorId && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setIsEditing(blog.id);
                            setFormData({
                              title: blog.title,
                              category: blog.category,
                              content: blog.content,
                              imageUrl: blog.imageUrl || ''
                            });
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4 hover:text-green-700 transition-colors">
                  {blog.title}
                </h3>
                <div className="prose prose-green max-w-none text-gray-600 mb-8 line-clamp-4">
                  <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLike(blog)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${blog.likes?.includes(user?.uid || '') ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Heart size={18} fill={blog.likes?.includes(user?.uid || '') ? 'currentColor' : 'none'} />
                      <span className="font-bold">{blog.likes?.length || 0}</span>
                    </button>

                    <button 
                      onClick={() => setActiveCommentBox(activeCommentBox === blog.id ? null : blog.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeCommentBox === blog.id ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <MessageCircle size={18} />
                      <span className="font-bold">{comments[blog.id]?.length || 0}</span>
                    </button>
                  </div>
                  
                  <button className="text-green-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                    Read Full Article <ArrowRight size={18} />
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {activeCommentBox === blog.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-100 overflow-hidden"
                    >
                      <div className="space-y-4 mb-6">
                        {comments[blog.id]?.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-4 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-sm text-gray-900">{comment.authorName}</span>
                              <span className="text-[10px] text-gray-400 uppercase font-bold">
                                {comment.createdAt?.toDate ? format(comment.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                          </div>
                        ))}
                        {(!comments[blog.id] || comments[blog.id].length === 0) && (
                          <p className="text-center text-gray-400 text-sm py-4 italic">No replies yet. Be the first to reply!</p>
                        )}
                      </div>

                      {user ? (
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Write a reply..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(blog.id)}
                            className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          />
                          <button 
                            onClick={() => handleAddComment(blog.id)}
                            disabled={isSubmittingComment || !commentText.trim()}
                            className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-center text-sm text-gray-500 py-2">Please log in to reply.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          )) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No blog posts yet. Stay tuned!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-green-600 rounded-3xl p-8 text-white shadow-xl">
            <h4 className="text-xl font-bold mb-4">Write for Us!</h4>
            <p className="text-green-100 mb-6">
              Have a tutorial or an experience to share? Contribute to our blog and earn leaderboard points!
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="block w-full text-center py-3 bg-white text-green-700 rounded-2xl font-bold hover:bg-green-50 transition-all"
            >
              Create Post
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-50">
            <h4 className="text-xl font-bold text-gray-900 mb-6">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {['Tutorials', 'Event Recaps', 'Interview Prep', 'Campus News', 'Tech Trends'].map(cat => (
                <span key={cat} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-green-50 hover:text-green-700 cursor-pointer transition-all">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
