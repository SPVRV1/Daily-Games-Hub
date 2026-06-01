import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Friends.css";

type FriendItem = {
  friendship_id: string;
  user: {
    _id: number;
    username?: string;
    email?: string;
    avatar_url?: string;
    current_streak?: number;
    games_played?: number;
  };
};

type RequestItem = {
  friendship_id: string;
  requester: {
    _id: number;
    username?: string;
    email?: string;
    avatar_url?: string;
    current_streak?: number;
    games_played?: number;
  };
};

type SearchResultItem = {
  user: {
    _id: number;
    username?: string;
    email?: string;
    avatar_url?: string;
    current_streak?: number;
    games_played?: number;
  };
  relation: {
    friendship_id?: string;
    status: "pending" | "accepted" | "rejected";
    requester_id: number;
    receiver_id: number;
  } | null;
};

const API = import.meta.env.VITE_API_URL ?? "";
const AVATAR_COLORS = [
  "#f38e10",
  "#8752f4",
  "#1ca0e2",
  "#ed4675",
  "#1db756",
  "#505cea",
];

const getAvatarColor = (seed: number) => {
  const index = Math.abs(seed) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export default function Friends() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);

  const fallbackUserId = useMemo(() => {
    const fromQuery = Number(searchParams.get("id"));

    if (!Number.isNaN(fromQuery) && fromQuery > 0) {
      return fromQuery;
    }

    const fromStorage = Number(localStorage.getItem("userId"));

    if (!Number.isNaN(fromStorage) && fromStorage > 0) {
      return fromStorage;
    }

    return Number.isNaN(fromStorage) ? null : fromStorage;
  }, [searchParams]);

  const [userId, setUserId] = useState<number | null>(fallbackUserId);

  useEffect(() => {
    if (fallbackUserId) {
      setUserId(fallbackUserId);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setUserId(null);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`${API}/api/user/data`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) {
          setUserId(null);
          return;
        }

        const resolvedId = Number(payload.user?._id);
        setUserId(Number.isNaN(resolvedId) ? null : resolvedId);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setUserId(null);
      }
    })();

    return () => controller.abort();
  }, [fallbackUserId]);

  const loadFriendsData = async () => {
    setLoading(true);

    if (!userId) {
      setFriends([]);
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch(`${API}/api/friends/${userId}`),
        fetch(`${API}/api/friends/${userId}/requests`),
      ]);

      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();

      if (!friendsRes.ok || !friendsData?.ok) {
        throw new Error(friendsData?.error || "Failed to load friends");
      }

      if (!requestsRes.ok || !requestsData?.ok) {
        throw new Error(requestsData?.error || "Failed to load requests");
      }

      setFriends(friendsData.friends || []);
      setRequests(requestsData.requests || []);
    } catch (error) {
      console.error("Failed to load friends page:", error);
      setFriends([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, [userId]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchMode(false);
      setSearchResults([]);
    }
  }, [search]);

  const filteredFriends = friends;

  const filteredRequests = requests;

  const filtered = tab === "friends" ? filteredFriends : filteredRequests;

  const handleRequestAction = async (
    friendshipId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      setActionLoadingId(friendshipId);

      const response = await fetch(
        `${API}/api/friends/${friendshipId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update request to ${status}`);
      }

      await loadFriendsData();
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      setActionLoadingId(friendshipId);

      const response = await fetch(`${API}/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }

      await loadFriendsData();
    } catch (error) {
      console.error("Failed to remove friend:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSearch = async () => {
    const query = search.trim();

    if (!query || !userId) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API}/api/friends/search/users?userId=${userId}&query=${encodeURIComponent(query)}`,
      );
      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Failed to search users");
      }

      setSearchResults(payload.users || []);
      setSearchMode(true);
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchResults([]);
      setSearchMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverId: number) => {
    if (!userId) {
      return;
    }
    try {
      setActionLoadingId(String(receiverId));

      const response = await fetch(`${API}/api/friends/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester_id: userId,
          receiver_id: receiverId,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Failed to send friend request");
      }

      await Promise.all([loadFriendsData(), handleSearch()]);
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const isShowingFriends = !searchMode && tab === "friends";
  const isShowingRequests = !searchMode && tab === "requests";

  return (
    <div className={`home${dark ? " dark" : ""}`}>
      {/* Navbar */}
      <div className="friends">
        <Navbar activeLink="friends" />
      </div>

      <main className="content">
        <div className="welcome">
          <h1>Friends</h1>
          <p>Connect with friends and compare your gaming progress</p>
        </div>

        <div className="fp-card fp-search-card">
          <div className="fp-search-row">
            <input
              className="fp-search-input"
              type="text"
              placeholder="Search for friends by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="fp-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="fp-tabs">
          <button
            className={`fp-tab${tab === "friends" ? " fp-tab--active" : ""}`}
            onClick={() => setTab("friends")}
          >
            My Friends ({friends.length})
          </button>
          <div className="fp-tab-wrapper">
            <button
              className={`fp-tab${tab === "requests" ? " fp-tab--active" : ""}`}
              onClick={() => setTab("requests")}
            >
              Friend Requests
            </button>

            {requests.length > 0 && (
              <span className="fp-badge">{requests.length}</span>
            )}
          </div>
        </div>

        <div className="fp-card">
          {loading && <p className="fp-empty">Loading...</p>}

          {!loading &&
            isShowingFriends &&
            filtered.map((item, i) => {
              const profile = "user" in item ? item.user : item.requester;

              return (
                <div
                  className={`fp-row${i < filtered.length - 1 ? " fp-row--border" : ""}`}
                  key={item.friendship_id}
                >
                  <div
                    className="fp-avatar"
                    style={{ background: getAvatarColor(profile._id) }}
                  >
                    {(profile.username?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div className="fp-info">
                    <span className="fp-name">
                      {profile.username ?? `User ${profile._id}`}
                    </span>
                    <div className="fp-meta">
                      <span className="fp-streak">
                        🔥 {profile.current_streak ?? 0} days
                      </span>
                      <span className="fp-games">
                        🏆 {profile.games_played ?? 0}/6 today
                      </span>
                    </div>
                  </div>
                  <div className="fp-actions">
                    <>
                      <button
                        className="fp-btn-view"
                        onClick={() => navigate(`/profile?id=${profile._id}`)}
                      >
                        View Profile
                      </button>
                      <button
                        className="fp-btn-remove"
                        onClick={() => handleRemoveFriend(item.friendship_id)}
                        disabled={actionLoadingId === item.friendship_id}
                      >
                        Remove
                      </button>
                    </>
                  </div>
                </div>
              );
            })}

          {!loading &&
            isShowingRequests &&
            filtered.map((item, i) => {
              const profile = "user" in item ? item.user : item.requester;

              return (
                <div
                  className={`fp-row${i < filtered.length - 1 ? " fp-row--border" : ""}`}
                  key={item.friendship_id}
                >
                  <div
                    className="fp-avatar"
                    style={{ background: getAvatarColor(profile._id) }}
                  >
                    {(profile.username?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div className="fp-info">
                    <span className="fp-name">
                      {profile.username ?? `User ${profile._id}`}
                    </span>
                    <div className="fp-meta">
                      <span className="fp-streak">
                        🔥 {profile.current_streak ?? 0} days
                      </span>
                      <span className="fp-games">
                        🏆 {profile.games_played ?? 0}/6 today
                      </span>
                    </div>
                  </div>
                  <div className="fp-actions">
                    <button
                      className="fp-btn-accept"
                      onClick={() =>
                        handleRequestAction(item.friendship_id, "accepted")
                      }
                      disabled={actionLoadingId === item.friendship_id}
                    >
                      Accept
                    </button>
                    <button
                      className="fp-btn-decline"
                      onClick={() =>
                        handleRequestAction(item.friendship_id, "rejected")
                      }
                      disabled={actionLoadingId === item.friendship_id}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}

          {!loading &&
            searchMode &&
            searchResults.map((item, i) => {
              const profile = item.user;
              const relation = item.relation;
              const isPendingIncoming =
                relation?.status === "pending" &&
                relation.receiver_id === userId;
              const isPendingOutgoing =
                relation?.status === "pending" &&
                relation.requester_id === userId;
              const isAccepted = relation?.status === "accepted";

              return (
                <div
                  className={`fp-row${i < searchResults.length - 1 ? " fp-row--border" : ""}`}
                  key={profile._id}
                >
                  <div
                    className="fp-avatar"
                    style={{ background: getAvatarColor(profile._id) }}
                  >
                    {(profile.username?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div className="fp-info">
                    <span className="fp-name">
                      {profile.username ?? `User ${profile._id}`}
                    </span>
                    <div className="fp-meta">
                      <span className="fp-streak">
                        🔥 {profile.current_streak ?? 0} days
                      </span>
                      <span className="fp-games">
                        🏆 {profile.games_played ?? 0}/6 today
                      </span>
                    </div>
                  </div>
                  <div className="fp-actions">
                    {isAccepted ? (
                      <>
                        <button
                          className="fp-btn-view"
                          onClick={() => navigate(`/profile?id=${profile._id}`)}
                        >
                          View Profile
                        </button>
                        <button
                          className="fp-btn-remove"
                          onClick={() =>
                            handleRemoveFriend(relation.friendship_id ?? "")
                          }
                          disabled={
                            !relation.friendship_id ||
                            actionLoadingId === relation.friendship_id
                          }
                        >
                          Remove
                        </button>
                      </>
                    ) : isPendingIncoming ? (
                      <>
                        <button
                          className="fp-btn-accept"
                          onClick={() =>
                            handleRequestAction(
                              relation.friendship_id ?? "",
                              "accepted",
                            )
                          }
                          disabled={
                            !relation.friendship_id ||
                            actionLoadingId === relation.friendship_id
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="fp-btn-decline"
                          onClick={() =>
                            handleRequestAction(
                              relation.friendship_id ?? "",
                              "rejected",
                            )
                          }
                          disabled={
                            !relation.friendship_id ||
                            actionLoadingId === relation.friendship_id
                          }
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        className="fp-btn-accept"
                        onClick={() => handleSendRequest(profile._id)}
                        disabled={
                          isPendingOutgoing ||
                          actionLoadingId === String(profile._id)
                        }
                      >
                        {isPendingOutgoing ? "Pending" : "Add Friend"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {!loading &&
            ((isShowingFriends && filtered.length === 0) ||
              (isShowingRequests && filtered.length === 0) ||
              (searchMode && searchResults.length === 0)) && (
              <p className="fp-empty">No results found.</p>
            )}
        </div>
      </main>
    </div>
  );
}
