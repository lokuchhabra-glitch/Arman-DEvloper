# Portfolio Backend

This folder is the backend entry point for the portfolio contact system.

## Run locally

From this folder:

```bash
node server.js
```

Or from the project root:

```bash
npm install
npm start
```

The API runs at `http://localhost:3000`.

## Endpoints

- `GET /api/status` - public health check
- `POST /api/submissions` - save a contact submission
- `GET /api/submissions` - list submissions
- `DELETE /api/submissions/:id` - delete one submission
- `DELETE /api/submissions` - delete all submissions

Submission routes require the `x-api-key` header. Set `API_KEY` in a root `.env` file to replace the development key.

## Contact form storage

Every successful contact form submission is saved automatically in:

- `backend/contact_submissions.json` - backend backup data
- `backend/contact_submissions.csv` - Excel-compatible spreadsheet file

Open `contact_submissions.csv` directly with Microsoft Excel. The server regenerates it after every new submission, deletion, or clear-all action.
