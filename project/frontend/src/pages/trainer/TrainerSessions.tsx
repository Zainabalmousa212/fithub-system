import { useMemo, useState } from "react";
import TrainerLayout from "@/components/TrainerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

type Session = {
  id: number;
  title: string;
  date: string;
  time: string; // could be "10:00 AM" or "14:00"
  duration: string; // e.g., "45 min"
  location: string;
  capacity: number;
  booked: number;
  status: string;
};

function formatTimeForDisplay(value: string) {
  // If already contains AM/PM, return as-is
  if (!value) return "";
  const upper = value.toUpperCase();
  if (upper.includes("AM") || upper.includes("PM")) return value;

  // Handle "HH:MM" (from <input type="time" />)
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  let hh = parseInt(match[1], 10);
  const mm = match[2];
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}

const TrainerSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      title: "HIIT Training",
      date: "2025-01-25",
      time: "10:00 AM",
      duration: "45 min",
      location: "Studio A",
      capacity: 12,
      booked: 8,
      status: "upcoming",
    },
    {
      id: 2,
      title: "Strength & Conditioning",
      date: "2025-01-26",
      time: "2:00 PM",
      duration: "60 min",
      location: "Gym Floor",
      capacity: 15,
      booked: 12,
      status: "upcoming",
    },
    {
      id: 3,
      title: "Boxing Fundamentals",
      date: "2025-01-28",
      time: "5:00 PM",
      duration: "45 min",
      location: "Boxing Ring",
      capacity: 8,
      booked: 6,
      status: "upcoming",
    },
  ]);

  const [newSession, setNewSession] = useState({
    title: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    capacity: "",
  });

  // Details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    capacity: "",
  });

  const handleCreateSession = () => {
    if (!newSession.title || !newSession.date || !newSession.time) {
      toast.error("Please fill in required fields");
      return;
    }

    const session: Session = {
      id: sessions.length + 1,
      title: newSession.title,
      date: newSession.date,
      time: formatTimeForDisplay(newSession.time),
      duration: newSession.duration || "45 min",
      location: newSession.location || "Gym Floor",
      capacity: parseInt(newSession.capacity) || 10,
      booked: 0,
      status: "upcoming",
    };

    setSessions([...sessions, session]);
    setNewSession({ title: "", date: "", time: "", duration: "", location: "", capacity: "" });
    toast.success("Session created successfully!");
  };

  function openSessionDetails(session: Session) {
    setSelectedSession(session);
    setDetailsOpen(true);
  }

  function openSessionEdit(session: Session) {
    setEditSessionId(session.id);
    setEditForm({
      title: session.title || "",
      date: session.date || "",
      // Convert display time like "10:00 AM" to a safe input value if possible
      // If already "HH:MM" keep it, else leave as-is (user can type).
      time: session.time || "",
      duration: session.duration || "",
      location: session.location || "",
      capacity: String(session.capacity ?? ""),
    });
    setEditOpen(true);
  }

  function handleSaveEdit() {
    if (editSessionId == null) return;

    if (!editForm.title || !editForm.date || !editForm.time) {
      toast.error("Please fill in required fields");
      return;
    }

    const nextCapacity = parseInt(editForm.capacity) || 10;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== editSessionId) return s;

        const updated: Session = {
          ...s,
          title: editForm.title,
          date: editForm.date,
          time: formatTimeForDisplay(editForm.time),
          duration: editForm.duration || s.duration,
          location: editForm.location || s.location,
          capacity: nextCapacity,
          // ensure booked does not exceed capacity
          booked: Math.min(s.booked, nextCapacity),
        };

        return updated;
      })
    );

    setEditOpen(false);
    setEditSessionId(null);
    toast.success("Session updated successfully!");
  }

  const stats = useMemo(() => {
    const totalBookings = sessions.reduce((sum, s) => sum + s.booked, 0);
    const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
    const fillRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;
    return { totalBookings, fillRate };
  }, [sessions]);

  return (
    <TrainerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session Management</h1>
            <p className="text-muted-foreground">Create and manage training sessions</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., HIIT Training"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="45 min"
                      value={newSession.duration}
                      onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="10"
                      value={newSession.capacity}
                      onChange={(e) => setNewSession({ ...newSession, capacity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Studio A"
                    value={newSession.location}
                    onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Details Dialog */}
        <Dialog
          open={detailsOpen}
          onOpenChange={(open) => {
            setDetailsOpen(open);
            if (!open) setSelectedSession(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
            </DialogHeader>

            {selectedSession && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium">{selectedSession.title}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedSession.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedSession.time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedSession.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedSession.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bookings</span>
                  <span className="font-medium">
                    {selectedSession.booked}/{selectedSession.capacity}
                  </span>
                </div>

                <div className="pt-2">
                  <Badge variant={selectedSession.booked === selectedSession.capacity ? "destructive" : "secondary"}>
                    {selectedSession.booked === selectedSession.capacity ? "Full" : "Available"}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditSessionId(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Session</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Session Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Time *</Label>
                  {/* keep type="text" to avoid breaking "10:00 AM" format;
                      user can type "10:00 AM" or "14:00" */}
                  <Input
                    id="edit-time"
                    placeholder="e.g., 10:00 AM or 14:00"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    placeholder="45 min"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    placeholder="10"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  placeholder="e.g., Studio A"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>

              <Button className="w-full" onClick={handleSaveEdit} disabled={editSessionId == null}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{sessions.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.fillRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Fill Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">18</p>
                <p className="text-sm text-muted-foreground mt-1">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <Badge variant={session.booked === session.capacity ? "destructive" : "secondary"}>
                    {session.booked}/{session.capacity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {session.time} • {session.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{session.booked} members booked</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openSessionDetails(session)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openSessionEdit(session)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TrainerLayout>
  );
};

export default TrainerSessions;
