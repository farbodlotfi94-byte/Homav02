
# Homa V.0

This is a code bundle for Homa V.0. The original project is available at https://www.figma.com/design/pdnbqZEUAqrUe6ZF67NOXt/Homa-V.00--Copy---Copy-.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Seller Dashboard Integration

The seller dashboard has been integrated into the main application and is accessible at `/seller` route.

### Features
- Complete seller dashboard with login, dashboard overview, product management, and settings
- Persian/Farsi UI with RTL support
- Product CRUD operations (Create, Read, Update, Delete)
- Dashboard analytics and statistics
- Try link generation for products

### Current Status
- ✅ UI integration complete - identical visual appearance to source
- ✅ Routing configured - accessible at `/seller`
- ✅ Build and dev server working
- ✅ Basic smoke tests added
- 🔄 Authentication integration pending (currently uses demo login)
- 🔄 API integration pending (currently uses mock data)

### Demo Login
For testing purposes, use:
- Phone: `09123456789`
- Password: `demo123`

### Technical Notes
- Preserved all CSS classes and visual styling from source
- Isolated seller dashboard in `src/integrations/seller-dashboard/`
- Used lazy loading for performance
- Added minimal test setup with Vitest
  