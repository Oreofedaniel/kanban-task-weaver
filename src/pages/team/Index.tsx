import { useCallback, useEffect, useState } from "react";
import styles from "./Team.module.css";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

interface RawTeam {
  _id: string;
  name: string;
  members?: Array<{ _id: string; name: string; role: string }>;
}

const normalize = (t: RawTeam): Team => ({
  id: t._id,
  name: t.name,
  members: (t.members || []).map((m) => ({ id: m._id, name: m.name, role: m.role })),
});

const errorMessage = (err: any, fallback: string) => {
  const m = err?.response?.data?.message;
  return Array.isArray(m) ? m.join(", ") : m || fallback;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTeam, setOpenTeam] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState("");

  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamNameValue, setTeamNameValue] = useState("");

  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", role: "" });

  const [newMember, setNewMember] = useState({ name: "", role: "" });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<RawTeam[]>("/teams");
      setTeams(data.map(normalize));
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err, "Failed to load teams"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
      await load();
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err, failure), variant: "destructive" });
    }
  };

  const handleCreateTeam = async () => {
    const name = newTeamName.trim();
    if (!name) return;
    await run(async () => {
      await api.post("/teams", { name });
      setNewTeamName("");
    }, "Failed to create team");
  };

  const handleSaveTeam = async (id: string) => {
    const name = teamNameValue.trim();
    setEditingTeam(null);
    if (!name) return;
    await run(() => api.patch(`/teams/${id}`, { name }), "Failed to rename team");
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`Delete "${team.name}" and all its members?`)) return;
    await run(async () => {
      await api.delete(`/teams/${team.id}`);
      if (openTeam === team.id) setOpenTeam(null);
    }, "Failed to delete team");
  };

  const handleAddMember = async (teamId: string) => {
    const name = newMember.name.trim();
    const role = newMember.role.trim();
    if (!name || !role) {
      toast({ title: "Missing information", description: "Enter a name and a role", variant: "destructive" });
      return;
    }
    await run(async () => {
      await api.post(`/teams/${teamId}/members`, { name, role });
      setNewMember({ name: "", role: "" });
    }, "Failed to add member");
  };

  const handleSaveMember = async (memberId: string) => {
    const name = editValues.name.trim();
    const role = editValues.role.trim();
    if (!name || !role) return;
    setEditingMember(null);
    await run(() => api.patch(`/teams/members/${memberId}`, { name, role }), "Failed to update member");
  };

  const handleRemoveMember = async (member: Member) => {
    if (!window.confirm(`Remove ${member.name} from this team?`)) return;
    await run(() => api.delete(`/teams/members/${member.id}`), "Failed to remove member");
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Our Teams</h1>
      <p className={styles.subtitle}>Discover the talented individuals who make up our teams</p>

      <div className={styles.addRow}>
        <input
          className={styles.input}
          placeholder="New team name..."
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
        />
        <button className={styles.primaryBtn} onClick={handleCreateTeam}>
          + Create Team
        </button>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading teams...</p>
      ) : teams.length === 0 ? (
        <p className={styles.empty}>No teams yet. Create your first team above.</p>
      ) : (
        <div className={styles.grid}>
          {teams.map((team) => (
            <div key={team.id} className={styles.card}>
              <div className={styles.teamHeader}>
                {editingTeam === team.id ? (
                  <div className={styles.editRow}>
                    <input
                      className={styles.input}
                      value={teamNameValue}
                      autoFocus
                      onChange={(e) => setTeamNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTeam(team.id)}
                    />
                    <button className={styles.saveBtn} onClick={() => handleSaveTeam(team.id)}>
                      💾
                    </button>
                    <button className={styles.cancelBtn} onClick={() => setEditingTeam(null)}>
                      ✖
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={styles.teamToggle}
                      onClick={() => setOpenTeam(openTeam === team.id ? null : team.id)}
                    >
                      {team.name} <span className={styles.memberCount}>{team.members.length}</span>{" "}
                      <span>{openTeam === team.id ? "▲" : "▼"}</span>
                    </button>
                    <span>
                      <button
                        className={styles.editBtn}
                        title="Rename team"
                        onClick={() => {
                          setEditingTeam(team.id);
                          setTeamNameValue(team.name);
                        }}
                      >
                        ✎
                      </button>
                      <button className={styles.cancelBtn} title="Delete team" onClick={() => handleDeleteTeam(team)}>
                        🗑
                      </button>
                    </span>
                  </>
                )}
              </div>

              {openTeam === team.id && (
                <>
                  <ul className={styles.memberList}>
                    {team.members.length === 0 && <li className={styles.empty}>No members yet.</li>}
                    {team.members.map((m) => (
                      <li key={m.id} className={styles.memberItem}>
                        {editingMember === m.id ? (
                          <div className={styles.editRow}>
                            <input
                              className={styles.input}
                              value={editValues.name}
                              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            />
                            <input
                              className={styles.input}
                              value={editValues.role}
                              onChange={(e) => setEditValues({ ...editValues, role: e.target.value })}
                            />
                            <button className={styles.saveBtn} onClick={() => handleSaveMember(m.id)}>
                              💾
                            </button>
                            <button className={styles.cancelBtn} onClick={() => setEditingMember(null)}>
                              ✖
                            </button>
                          </div>
                        ) : (
                          <>
                            <span>
                              <span className={styles.memberName}>{m.name}</span>{" "}
                              <span className={styles.memberRole}>– {m.role}</span>
                            </span>
                            <span>
                              <button
                                className={styles.editBtn}
                                title="Edit member"
                                onClick={() => {
                                  setEditingMember(m.id);
                                  setEditValues({ name: m.name, role: m.role });
                                }}
                              >
                                ✎
                              </button>
                              <button className={styles.cancelBtn} title="Remove member" onClick={() => handleRemoveMember(m)}>
                                ✖
                              </button>
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className={styles.addMemberRow}>
                    <input
                      className={styles.input}
                      placeholder="Name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                    <input
                      className={styles.input}
                      placeholder="Role"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleAddMember(team.id)}
                    />
                    <button className={styles.primaryBtn} onClick={() => handleAddMember(team.id)}>
                      Add
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
