@echo off
echo =====================================
echo CLEANING SERVICE IMAGES VERIFICATION
echo =====================================
echo.

cd /d "C:\Users\Baqir\Documents\EleventhHour Cleaning Website\eleventhhour\public"

echo Checking directory: %CD%
echo.

set "missing_count=0"
set "total_count=16"

echo HOUSEHOLD GALLERY IMAGES:
echo --------------------------
if exist "hh-gallery-1.jpg" (echo ✓ hh-gallery-1.jpg [FOUND]) else (echo ✗ hh-gallery-1.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-gallery-2.jpg" (echo ✓ hh-gallery-2.jpg [FOUND]) else (echo ✗ hh-gallery-2.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-gallery-3.jpg" (echo ✓ hh-gallery-3.jpg [FOUND]) else (echo ✗ hh-gallery-3.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-gallery-4.jpg" (echo ✓ hh-gallery-4.jpg [FOUND]) else (echo ✗ hh-gallery-4.jpg [MISSING] & set /a missing_count+=1)
echo.

echo COMMERCIAL GALLERY IMAGES:
echo ---------------------------
if exist "com-gallery-1.jpg" (echo ✓ com-gallery-1.jpg [FOUND]) else (echo ✗ com-gallery-1.jpg [MISSING] & set /a missing_count+=1)
if exist "com-gallery-2.jpg" (echo ✓ com-gallery-2.jpg [FOUND]) else (echo ✗ com-gallery-2.jpg [MISSING] & set /a missing_count+=1)
if exist "com-gallery-3.jpg" (echo ✓ com-gallery-3.jpg [FOUND]) else (echo ✗ com-gallery-3.jpg [MISSING] & set /a missing_count+=1)
if exist "com-gallery-4.jpg" (echo ✓ com-gallery-4.jpg [FOUND]) else (echo ✗ com-gallery-4.jpg [MISSING] & set /a missing_count+=1)
echo.

echo HOUSEHOLD SERVICE IMAGES:
echo --------------------------
if exist "hh-regular.jpg" (echo ✓ hh-regular.jpg [FOUND]) else (echo ✗ hh-regular.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-deep.jpg" (echo ✓ hh-deep.jpg [FOUND]) else (echo ✗ hh-deep.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-eot.jpg" (echo ✓ hh-eot.jpg [FOUND]) else (echo ✗ hh-eot.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-carpet.jpg" (echo ✓ hh-carpet.jpg [FOUND]) else (echo ✗ hh-carpet.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-oven.jpg" (echo ✓ hh-oven.jpg [FOUND]) else (echo ✗ hh-oven.jpg [MISSING] & set /a missing_count+=1)
if exist "hh-windows.jpg" (echo ✓ hh-windows.jpg [FOUND]) else (echo ✗ hh-windows.jpg [MISSING] & set /a missing_count+=1)
echo.

echo COMMERCIAL SERVICE IMAGES:
echo ----------------------------
if exist "com-office.jpg" (echo ✓ com-office.jpg [FOUND]) else (echo ✗ com-office.jpg [MISSING] & set /a missing_count+=1)
if exist "com-retail.jpg" (echo ✓ com-retail.jpg [FOUND]) else (echo ✗ com-retail.jpg [MISSING] & set /a missing_count+=1)
if exist "com-hospitality.jpg" (echo ✓ com-hospitality.jpg [FOUND]) else (echo ✗ com-hospitality.jpg [MISSING] & set /a missing_count+=1)
if exist "com-education.jpg" (echo ✓ com-education.jpg [FOUND]) else (echo ✗ com-education.jpg [MISSING] & set /a missing_count+=1)
if exist "com-industrial.jpg" (echo ✓ com-industrial.jpg [FOUND]) else (echo ✗ com-industrial.jpg [MISSING] & set /a missing_count+=1)
if exist "com-builders.jpg" (echo ✓ com-builders.jpg [FOUND]) else (echo ✗ com-builders.jpg [MISSING] & set /a missing_count+=1)
echo.

echo =====================================
echo SUMMARY:
echo =====================================
set /a found_count=%total_count%-%missing_count%
echo Total images required: %total_count%
echo Images found: %found_count%
echo Images missing: %missing_count%
echo.

if %missing_count%==0 (
    echo ✓ ALL IMAGES DOWNLOADED SUCCESSFULLY!
    echo Your cleaning service website now has all required images.
) else (
    echo ✗ SOME IMAGES ARE MISSING
    echo Please download the missing images using the guide provided.
    echo Refer to: image_download_guide.txt for instructions.
)

echo.
echo Current files in public directory:
dir /b *.jpg 2>nul
if errorlevel 1 echo No JPG files found in current directory.

echo.
pause