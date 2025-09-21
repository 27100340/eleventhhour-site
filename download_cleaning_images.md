# Cleaning Service Images Download Guide

## Overview
This guide provides specific recommendations for downloading professional cleaning service images for your website. Each image should be high-quality, professional, and suitable for commercial use.

## Required Images and Recommendations

### Gallery Images - Household Cleaning (4 images)
**Files needed:** `hh-gallery-1.jpg`, `hh-gallery-2.jpg`, `hh-gallery-3.jpg`, `hh-gallery-4.jpg`

**Image types to search for:**
1. **hh-gallery-1.jpg**: Professional cleaner vacuuming a living room
2. **hh-gallery-2.jpg**: Kitchen being cleaned, focus on countertops and appliances
3. **hh-gallery-3.jpg**: Bathroom cleaning, showing sparkling clean surfaces
4. **hh-gallery-4.jpg**: Bedroom cleaning, making beds and dusting

**Search terms:** "household cleaning professional", "home cleaning service", "domestic cleaning"

### Gallery Images - Commercial Cleaning (4 images)
**Files needed:** `com-gallery-1.jpg`, `com-gallery-2.jpg`, `com-gallery-3.jpg`, `com-gallery-4.jpg`

**Image types to search for:**
1. **com-gallery-1.jpg**: Office space being cleaned, professional cleaner with equipment
2. **com-gallery-2.jpg**: Commercial floor cleaning with industrial equipment
3. **com-gallery-3.jpg**: Window cleaning on commercial building
4. **com-gallery-4.jpg**: Team of cleaners in commercial space

**Search terms:** "commercial cleaning service", "office cleaning professional", "industrial cleaning"

### Service-Specific Images - Household

#### Regular Services
- **hh-regular.jpg**: Regular house cleaning routine, cleaner with standard supplies
- **hh-deep.jpg**: Deep cleaning scene, detailed cleaning with specialized equipment
- **hh-eot.jpg**: End of tenancy cleaning, empty room being thoroughly cleaned

**Search terms:** "regular house cleaning", "deep cleaning service", "end of tenancy cleaning"

#### Specialist Services
- **hh-carpet.jpg**: Carpet cleaning with steam cleaner or professional equipment
- **hh-oven.jpg**: Oven cleaning, focus on before/after or cleaning process
- **hh-windows.jpg**: Window cleaning, residential windows being cleaned

**Search terms:** "carpet cleaning professional", "oven cleaning service", "window cleaning residential"

### Service-Specific Images - Commercial

- **com-office.jpg**: Office cleaning, focus on desks, computers, professional environment
- **com-retail.jpg**: Retail store cleaning, shopping area or store front
- **com-hospitality.jpg**: Hotel or restaurant cleaning, professional hospitality cleaning
- **com-education.jpg**: School or classroom cleaning, educational facility
- **com-industrial.jpg**: Industrial facility cleaning, warehouse or factory
- **com-builders.jpg**: Post-construction cleaning, cleaning up after building work

**Search terms:** "office cleaning service", "retail cleaning", "hotel cleaning", "school cleaning", "industrial cleaning", "post construction cleaning"

## Recommended Free Stock Photo Sources

### Primary Sources (Free for Commercial Use)
1. **Unsplash** (https://unsplash.com)
   - Search: Use specific terms above
   - License: Free for commercial use
   - Quality: High resolution, professional

2. **Pexels** (https://pexels.com)
   - Search: "cleaning service", "professional cleaning"
   - License: Free for commercial use
   - Quality: High resolution

3. **Pixabay** (https://pixabay.com)
   - Search: "cleaning professional", "commercial cleaning"
   - License: Free for commercial use
   - Quality: Good resolution options

### Alternative Sources
4. **Freepik** (https://freepik.com)
   - Free account required
   - Attribution may be required for free accounts
   - Professional quality images

## Download Instructions

### For each image:
1. Visit the recommended source websites
2. Search using the specific terms provided
3. Look for images that match the description
4. Download in high resolution (preferably 1920x1080 or higher)
5. Rename the file to match the exact filename needed
6. Save to the `public` directory in your project

### File Specifications
- **Format**: JPG preferred
- **Resolution**: Minimum 1200x800, prefer 1920x1080
- **File size**: Aim for 500KB-2MB for web optimization
- **Quality**: High quality, professional appearance

## Quick Download Commands

Once you have the image URLs, you can use these commands to download them:

```bash
# Example downloads (replace URLs with actual image URLs)
cd "C:\Users\Baqir\Documents\EleventhHour Cleaning Website\eleventhhour\public"

# Household gallery images
curl -o hh-gallery-1.jpg "[URL_FOR_HOUSEHOLD_GALLERY_1]"
curl -o hh-gallery-2.jpg "[URL_FOR_HOUSEHOLD_GALLERY_2]"
curl -o hh-gallery-3.jpg "[URL_FOR_HOUSEHOLD_GALLERY_3]"
curl -o hh-gallery-4.jpg "[URL_FOR_HOUSEHOLD_GALLERY_4]"

# Commercial gallery images
curl -o com-gallery-1.jpg "[URL_FOR_COMMERCIAL_GALLERY_1]"
curl -o com-gallery-2.jpg "[URL_FOR_COMMERCIAL_GALLERY_2]"
curl -o com-gallery-3.jpg "[URL_FOR_COMMERCIAL_GALLERY_3]"
curl -o com-gallery-4.jpg "[URL_FOR_COMMERCIAL_GALLERY_4]"

# Household service images
curl -o hh-regular.jpg "[URL_FOR_REGULAR_CLEANING]"
curl -o hh-deep.jpg "[URL_FOR_DEEP_CLEANING]"
curl -o hh-eot.jpg "[URL_FOR_EOT_CLEANING]"
curl -o hh-carpet.jpg "[URL_FOR_CARPET_CLEANING]"
curl -o hh-oven.jpg "[URL_FOR_OVEN_CLEANING]"
curl -o hh-windows.jpg "[URL_FOR_WINDOW_CLEANING]"

# Commercial service images
curl -o com-office.jpg "[URL_FOR_OFFICE_CLEANING]"
curl -o com-retail.jpg "[URL_FOR_RETAIL_CLEANING]"
curl -o com-hospitality.jpg "[URL_FOR_HOSPITALITY_CLEANING]"
curl -o com-education.jpg "[URL_FOR_EDUCATION_CLEANING]"
curl -o com-industrial.jpg "[URL_FOR_INDUSTRIAL_CLEANING]"
curl -o com-builders.jpg "[URL_FOR_BUILDERS_CLEANING]"
```

## License Compliance

All recommended sources provide images that are:
- ✅ Free for commercial use
- ✅ No attribution required (but appreciated)
- ✅ High quality and professional
- ✅ Suitable for cleaning service websites

## Verification Checklist

After downloading, verify:
- [ ] All 16 image files are present in the `public` directory
- [ ] File names match exactly as specified
- [ ] Images are high quality and professional
- [ ] File sizes are reasonable for web use (500KB-2MB)
- [ ] Images are relevant to their specific service categories

## Image Optimization (Optional)

After downloading, you may want to optimize images for web use:

```bash
# Install imagemagick for image optimization (if not already installed)
# Then resize/optimize images:
mogrify -resize 1920x1080> -quality 85 *.jpg
```

This guide ensures you get professional, commercially-licensed images that will enhance your cleaning service website's visual appeal and credibility.