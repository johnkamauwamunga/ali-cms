# Portfolio CMS Manual

This manual explains how to browse the public portfolio and use its local admin workspace.

## Start the application

1. Open a terminal in the project folder.
2. Install dependencies if this is the first run:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open the local URL printed by Vite, normally `http://localhost:5173`.

The application uses sample content from `src/data/data.json`. Changes made in the browser are saved in local storage on that browser and device.

## Browse the public portfolio

The home page (`/`) contains the profile introduction and these sections: About, Experience, Skills, Projects, Education, Certifications, Interests, and Contact. Use the navigation links to jump to a section. On a phone, open **Menu** to display the navigation links.

- Use **Explore my work** or the Projects navigation link to reach the project cards.
- Select **All projects** to open `/projects`. Filter the list by project category.
- Select a project card to view its details at `/projects/:slug`.
- Use the email link in Contact to start an email in your mail application.
- Social links and CV links open their configured destinations.
- The footer contains quick links and an Admin link.

Only published content appears on the public website. Sections can also be hidden in admin settings.

## Open the admin workspace

The admin workspace is available at `/admin`. The sidebar links to:

- **Overview** — content counts, publication totals, and quick actions.
- **Profile** — your public identity and biography.
- **Experience, Skills, Projects, Education, Certifications, Interests** — content management pages.
- **CV Generator** — build and preview a CV from portfolio information.
- **Settings** — website theme and display preferences.
- **Authentication** — configure the prototype login screen and mock credentials.

On smaller screens, use the menu button to open the sidebar. Choose a destination or click outside the sidebar to close it. The Escape key also closes the open drawer.

The admin pages are a local prototype. **They are not protected by authentication.** The login screen does not secure these routes or provide production-grade access control.

## Manage portfolio content

On a collection page:

1. Choose **Add** to create an entry, or select the edit button beside an existing entry.
2. Fill in the entry details. For fields labeled as JSON arrays, enter valid JSON array syntax, for example `["React", "Node.js"]`.
3. Select **Save changes**. The update is reflected in the shared portfolio state and saved in local storage.
4. Use the publication checkbox to publish or unpublish an entry.
5. Search by text or filter by publication status.
6. Use the up/down arrows to change the entry order.
7. Use the delete button to remove an entry; confirm the prompt to complete deletion.

Projects can be featured and include a URL slug, technology list, image, GitHub link, and live link. Skills support an icon identifier and icon source (`simple-icons` or `lucide`). The icon identifier must match an icon supported by the app to display a specific icon.

Profile editing includes contact and social links, CV URL, About content, and professional statistics. References are managed in **CV Generator** and are not displayed on the public portfolio.

## Configure the site

Open **Settings** to:

- Choose light, dark, or system theme.
- Set the shared accent color.
- Edit website title and description.
- Configure default CV and profile image URLs.
- Show or hide public sections.
- Edit the navigation logo and links.
- Change footer text.
- **Export JSON** to download the current portfolio data.
- **Reset mock data** to restore the original sample portfolio. Resetting discards saved browser changes after confirmation.

Navigation entries use a JSON array with `label` and `href`, for example:

```json
[
  { "label": "About", "href": "#about" },
  { "label": "Projects", "href": "#projects" }
]
```

Use section IDs such as `#about`, `#experience`, `#skills`, `#projects`, `#education`, `#certifications`, `#interests`, or `#contact`.

## Build a CV

Open **CV Generator** from the admin sidebar.

1. Edit the CV title and professional summary. The profile biography is used when the summary is blank.
2. Choose the **Professional** or **Modern** template.
3. Configure font size, margins, accent color, and optional profile image.
4. Toggle sections on or off and use the arrows to change their order.
5. Select which portfolio records to include under each section.
6. Add, edit, reorder, or remove references. Enable **Include in CV** on each reference you want to use.
7. Turn on **Include References** to show selected references in the document. Contact details for references are hidden unless you separately enable reference email and/or phone.
8. Select **Save CV settings** to persist your configuration.
9. Choose **Print / Save PDF** and use the browser's print dialog to print or save an A4 PDF.

On mobile, use the **Preview** button to switch between the editor and document preview.

## Configure the demo login

Open **Authentication** from the sidebar or the Settings page.

- Set the admin email and optional phone number.
- Choose password-only or password-plus-security-question verification.
- Configure the welcome text, appearance, security question, and demo session duration.
- Create or change a password and security answer, confirming each value before saving.

The demo requires a password and, when enabled, a security answer before the login flow can continue. Credentials are stored as salted PBKDF2 hashes in local storage, not as plaintext. This is still only a client-side prototype: it has no server-side authorization, session protection, rate limiting, or secure account recovery. Do not use real or reused passwords or personal security answers here. The **Open workspace** link and direct `/admin` route bypass the mock login.

## Data and privacy notes

- Portfolio content, CV configuration, references, and mock credential hashes are stored in browser local storage.
- Data is not synchronized to other browsers or devices.
- Clearing site data removes locally saved changes.
- Export a JSON backup before resetting or clearing browser storage if you want to preserve your changes.
- The browser cannot update the original `src/data/data.json` file; resetting reloads that bundled sample data.
