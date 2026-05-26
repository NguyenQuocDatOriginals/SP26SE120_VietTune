# Frontend Implementation Guide: RAG Chat Integration

This document outlines the available endpoints for integrating the RAG (Retrieval-Augmented Generation) Chat feature into the frontend application. 

**Base Route:** `/api/rag-chat`
**Authentication:** All endpoints require a valid JWT Bearer Token (`[Authorize]`). The `userId` is automatically extracted from the token.

## 1. Core Chat Workflow (For Regular Users)

These endpoints are used to build the standard chat interface.

*   **Create a new conversation**
    *   `POST /api/rag-chat/conversations`
    *   **Body:** `CreateConversationRequest`
    *   **Returns:** The created conversation details.

*   **Get all conversations for the current user**
    *   `GET /api/rag-chat/conversations`
    *   **Returns:** A list of the user's past conversations.

*   **Get a specific conversation history**
    *   `GET /api/rag-chat/conversations/{id}`
    *   **Returns:** Full details and message history of the specified conversation.

*   **Send a message to a conversation**
    *   `POST /api/rag-chat/conversations/{id}/messages`
    *   **Body:** `SendMessageRequest` (Contains the user's prompt).
    *   **Returns:** The AI's response message.

*   **Delete a conversation**
    *   `DELETE /api/rag-chat/conversations/{id}`
    *   **Returns:** `204 No Content` on success.

---

## 2. ⚠️ IMPORTANT: Embeddings & Backfill Endpoints (Admin ONLY)

Please be aware of the following endpoints related to embedding generation:

*   `POST /api/rag-chat/embeddings/backfill`
*   `POST /api/rag-chat/embeddings/backfill-768`
*   `POST /api/rag-chat/embeddings/regenerate/{recordingId}`

### 🛑 CRITICAL NOTE FOR FRONTEND DEVELOPERS:
**DO NOT** call these backfill endpoints from the standard user Chat Interface.

1.  **Admin Role Only:** These endpoints are strictly protected with `[Authorize(Roles = "Admin")]`. Calling them with any other role (e.g., standard user, researcher, contributor) will result in a `403 Forbidden` error.
2.  **No "Backfill 768" for normal roles:** The `backfill-768` (and the standard `backfill`) functionality is designed exclusively for the **Admin Dashboard** to synchronize and generate missing vector embeddings for recordings in the database. 
3.  **Chat functionality does NOT require backfilling:** Normal users interacting with the chatbot do not need to trigger backfills. The chat system automatically retrieves existing knowledge; it is the Admin's job to ensure the database is fully embedded using these specific endpoints in the admin panel.

**Summary:** Only implement the `backfill` and `regenerate` API calls in the Admin section of the frontend application. Leave them entirely out of the regular user's RAG chat UI.
