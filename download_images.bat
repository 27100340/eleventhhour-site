@echo off
echo Downloading cleaning service images...
echo.

cd /d "C:\Users\Baqir\Documents\EleventhHour Cleaning Website\eleventhhour\public"

echo Current directory: %CD%
echo.

REM Create placeholders for now - you'll need to replace these URLs with actual image URLs from the stock photo sites
echo Downloading household gallery images...
echo [INFO] You need to manually download these images from the recommended sources:
echo.
echo Required household gallery images:
echo - hh-gallery-1.jpg (household cleaning scene)
echo - hh-gallery-2.jpg (kitchen cleaning)
echo - hh-gallery-3.jpg (bathroom cleaning)
echo - hh-gallery-4.jpg (bedroom cleaning)
echo.

echo Required commercial gallery images:
echo - com-gallery-1.jpg (office cleaning)
echo - com-gallery-2.jpg (commercial floor cleaning)
echo - com-gallery-3.jpg (commercial window cleaning)
echo - com-gallery-4.jpg (cleaning team)
echo.

echo Required household service images:
echo - hh-regular.jpg (regular cleaning)
echo - hh-deep.jpg (deep cleaning)
echo - hh-eot.jpg (end of tenancy)
echo - hh-carpet.jpg (carpet cleaning)
echo - hh-oven.jpg (oven cleaning)
echo - hh-windows.jpg (window cleaning)
echo.

echo Required commercial service images:
echo - com-office.jpg (office cleaning)
echo - com-retail.jpg (retail cleaning)
echo - com-hospitality.jpg (hotel/restaurant cleaning)
echo - com-education.jpg (school cleaning)
echo - com-industrial.jpg (industrial cleaning)
echo - com-builders.jpg (post-construction cleaning)
echo.

echo To download images:
echo 1. Visit https://www.pexels.com/search/cleaning/
echo 2. Visit https://unsplash.com/s/photos/cleaning
echo 3. Search for specific cleaning types mentioned above
echo 4. Download high-quality images (1920x1080 or similar)
echo 5. Rename them to match the required filenames
echo 6. Save them in this directory: %CD%
echo.

echo Example curl commands (replace [URL] with actual image URLs):
echo curl -o hh-gallery-1.jpg "[URL_FOR_HOUSEHOLD_GALLERY_1]"
echo curl -o hh-gallery-2.jpg "[URL_FOR_HOUSEHOLD_GALLERY_2]"
echo curl -o com-gallery-1.jpg "[URL_FOR_COMMERCIAL_GALLERY_1]"
echo etc...

pause