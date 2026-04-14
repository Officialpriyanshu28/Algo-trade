import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Shield, 
  TrendingUp, 
  Calendar, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Filter,
  MoreHorizontal,
  UserCheck,
  Activity
} from "lucide-react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface Member {
  uid: string;
  displayName: string;
  photoURL: string;
  lastSeen: any;
  email?: string; // Only visible to admins
  balance?: number; // Only visible to admins
}

export default function Community() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    if (user?.email === "yaduvanshipriyanshukumar28@gmail.com") {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    const q = query(
      collection(db, "public_profiles"),
      orderBy("lastSeen", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const publicData = (snapshot.docs || []).map(doc => ({
        ...doc.data()
      })) as Member[];

      // If admin, we could fetch more data from 'users' collection
      // But for now, we'll just show the public list
      setMembers(publicData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "public_profiles");
    });

    return unsubscribe;
  }, []);

  const filteredMembers = members.filter(m => 
    m.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            Nexus Community
          </h1>
          <p className="text-slate-400 mt-1">Connect with other traders and see who's active on the platform.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-3"
        >
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">Admin Mode Active: You have elevated permissions to view member data.</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member, i) => (
            <motion.div
              key={member.uid}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img 
                    src={member.photoURL || `https://ui-avatars.com/api/?name=${member.displayName}`} 
                    alt={member.displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-cyan-500/50 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {member.displayName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    Joined April 2026
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Strategies</span>
                  <span className="text-sm font-bold text-white">12 Active</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</span>
                  <span className="text-sm font-bold text-green-400">68.4%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Last Active</span>
                  </div>
                  <span className="text-slate-300">Just now</span>
                </div>
                
                {isAdmin && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-3 border-t border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-cyan-400/70">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </div>
                      <span className="text-slate-400 truncate max-w-[120px]">hidden@example.com</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-cyan-400/70">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Balance</span>
                      </div>
                      <span className="text-slate-400">$100,000.00</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <button className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2">
                View Profile <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-white">No members found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
        </div>
      )}

      <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Verified Traders</h3>
            <p className="text-slate-400">Join the elite group of traders with verified track records.</p>
          </div>
        </div>
        <button className="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
          Apply for Verification <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
