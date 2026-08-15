# SMRUTI API Documentation

Welcome to the **SMRUTI REST API** specification. SMRUTI is a multi-user, multi-family private digital heritage platform.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

---

## Authentication & Security Overview
- **Session Authentication**: Uses secure HTTP-only cookies (`connect.sid`) or Bearer tokens.
- **Google OAuth 2.0**: Endpoint `/api/auth/google`.
- **Data Isolation**: Every family-owned endpoint requires a verified family membership. Cross-family queries are strictly rejected with `403 Forbidden` / `404 Not Found`.

---

## API Endpoints Summary

### 1. Health & Status
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check & database connection status | No |

---

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/auth/google` | Initiates Google OAuth 2.0 flow | No |
| `GET` | `/api/auth/google/callback` | OAuth redirect callback handler | No |
| `GET` | `/api/auth/me` | Returns current user & authorized families | Yes |
| `POST` | `/api/auth/logout` | Destroys current session and clears cookie | Yes |
| `GET` | `/api/auth/status` | Quick boolean auth status check | No |
| `POST` | `/api/auth/dev-login` | Local development login simulation | No |

---

### 3. User Profile (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/me` | Fetch detailed user profile | Yes |
| `PUT` | `/api/users/me` | Update profile (name, photo, language, etc.) | Yes |

---

### 4. Families (`/api/families`)
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `POST` | `/api/families` | Create a new family space | Any authenticated |
| `GET` | `/api/families/:familyId` | Get family space details | `MEMBER` |
| `PUT` | `/api/families/:familyId` | Update family info (name, description, photo) | `OWNER` |
| `POST` | `/api/families/:familyId/invite`| Send invitation link/token | `ADULT_MEMBER` |
| `POST` | `/api/families/accept-invitation`| Accept invitation and join family | Authenticated |

---

### 5. Family Members (`/api/families/:familyId/members`)
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/members` | List all family members with metadata | `VIEWER` |
| `GET` | `/api/families/:familyId/members/:memberId` | Get single member profile | `VIEWER` |
| `POST` | `/api/families/:familyId/members` | Add a new family member | `ADULT_MEMBER` |
| `PUT` | `/api/families/:familyId/members/:memberId` | Edit family member details | `ADULT_MEMBER` |
| `DELETE` | `/api/families/:familyId/members/:memberId` | Remove member & clean relationships | `OWNER` |
| `POST` | `/api/families/:familyId/members/:memberId/link-user` | Link Google account to member | `OWNER` |

---

### 6. Family Tree & Genealogy (`/api/families/:familyId/tree`)
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/tree` | Returns couples, generations & graph tree | `VIEWER` |
| `POST` | `/api/families/:familyId/tree/relationships` | Add parent-child or spouse edge | `ADULT_MEMBER` |
| `DELETE` | `/api/families/:familyId/tree/relationships` | Remove relationship edge | `ADULT_MEMBER` |

---

### 7. Memories (`/api/families/:familyId/memories`)
| Method | Endpoint | Query Parameters | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/memories` | `category`, `type`, `year`, `person`, `favorite`, `search`, `page`, `limit` | `VIEWER` |
| `GET` | `/api/families/:familyId/memories/:memoryId` | None | `VIEWER` |
| `POST` | `/api/families/:familyId/memories` | Request body with title, date, image, gallery | `MEMBER` |
| `PUT` | `/api/families/:familyId/memories/:memoryId` | Update memory content | `MEMBER` |
| `DELETE`| `/api/families/:familyId/memories/:memoryId` | Delete memory | `ADULT_MEMBER` |
| `POST` | `/api/families/:familyId/memories/:memoryId/favorite` | Toggle favorite status | `VIEWER` |

---

### 8. Stories (`/api/families/:familyId/stories`)
| Method | Endpoint | Query Parameters | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/stories` | `category`, `search`, `favorite`, `page`, `limit` | `VIEWER` |
| `GET` | `/api/families/:familyId/stories/:storyId` | None | `VIEWER` |
| `POST` | `/api/families/:familyId/stories` | Request body with title, text, audioUrl, author | `MEMBER` |
| `PUT` | `/api/families/:familyId/stories/:storyId` | Update story | `MEMBER` |
| `DELETE`| `/api/families/:familyId/stories/:storyId` | Delete story | `ADULT_MEMBER` |
| `POST` | `/api/families/:familyId/stories/:storyId/favorite` | Toggle favorite | `VIEWER` |

---

### 9. Recipes (`/api/families/:familyId/recipes`)
| Method | Endpoint | Query Parameters | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/recipes` | `category`, `difficulty`, `search`, `favorite`, `page`, `limit` | `VIEWER` |
| `GET` | `/api/families/:familyId/recipes/:recipeId` | None | `VIEWER` |
| `POST` | `/api/families/:familyId/recipes` | Request body with name, ingredients, steps, story | `MEMBER` |
| `PUT` | `/api/families/:familyId/recipes/:recipeId` | Update recipe | `MEMBER` |
| `DELETE`| `/api/families/:familyId/recipes/:recipeId` | Delete recipe | `ADULT_MEMBER` |
| `POST` | `/api/families/:familyId/recipes/:recipeId/favorite` | Toggle favorite | `VIEWER` |

---

### 10. Timeline & Milestones (`/api/families/:familyId/timeline`)
| Method | Endpoint | Query Parameters | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/timeline` | `year`, `category` | `VIEWER` |
| `POST` | `/api/families/:familyId/timeline` | Request body with year, title, date, location | `MEMBER` |
| `PUT` | `/api/families/:familyId/timeline/:eventId` | Update event | `MEMBER` |
| `DELETE`| `/api/families/:familyId/timeline/:eventId` | Delete event | `ADULT_MEMBER` |

---

### 11. On This Day (`/api/families/:familyId/on-this-day`)
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/on-this-day` | Returns memories and events matching today's date from previous years | `VIEWER` |

---

### 12. Global Search (`/api/families/:familyId/search`)
| Method | Endpoint | Query Parameters | Min Role |
|---|---|---|---|
| `GET` | `/api/families/:familyId/search` | `q=search_term` | `VIEWER` |

---

### 13. Media Upload (`/api/families/:familyId/media/upload`)
| Method | Endpoint | Format | Min Role |
|---|---|---|---|
| `POST` | `/api/families/:familyId/media/upload` | `multipart/form-data` with `file` | `MEMBER` |

---

### 14. Notifications & Activity
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | User's notifications & unread count | Yes |
| `PATCH`| `/api/notifications/:id/read` | Mark single notification as read | Yes |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications as read | Yes |
| `GET` | `/api/notifications/activity/:familyId` | Family activity feed | Yes |
