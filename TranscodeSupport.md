# Transcode support
Hydrus-react supports usage of smaller file transcodes. It's done using separate local file service and a namespace. It allows users to use transcode large videos/images etc. into smaller "web-friendly" versions which will help with page load speed and responsivness.


# How to use
Information below is more of a recommendation on how to use this feature, based on my own usage. The way it actually works allows for more specific/creative ways of replacing what file gets loaded and how. This is just a basic use case I came up with.
## Hydrus
1. Inside hydrus client you have to create a separate 'local file domain' under "*services/manage services/add/local file domain*".
2. Default name for that file domain is "*web-transcodes*" although you can use whatever and change the name in hydrus-react.

## Preparing files
1. Export files you want to have transcoded versions making sure they keep their hydrus hash as a filename.
This happens by default when drag and dropping them from hydrus window.
2. Use image converter of your choice to create a smaller version of a file.
Personally I use ImageMagick converting image files to WebP and gifs (especially large ones >100MB) using google's gif2webp
2. Make sure that gifs are encoded into webp not webm format as then the file type mismatch will prevent displaying of them in hydrus-react
3. This should give you output that keeps the file name (hash) with changed file extension.

## Re-importing to hydrus
1. Import transcoded files making sure that file domain is set as "web-transcodes" (*file import option/default options > custom file import option/import destination > 'web-transcodes'*)
2. Add tags before import
2. *add filename? [namespace] > set wanted namespace*, default "*original*"
After import file should have 1 tag which is it's original file hash

## hydrus-react
Hydrus react can be configured to use user defined local file domain inside settings page.
You can configure file domain name, namespace of original filename hash, and whether or not even use this function altogether.

If everything was done correctly next time you load given image in hydrus-react you should get transcoded image instead of original one.

# Future
I'm planning to create some sort of tool to automate above steps.