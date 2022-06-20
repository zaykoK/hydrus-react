export function setPageTitle(tags: Array<Array<string>>, page: number,type:string) {
    if (tags.length === 0) {
      switch (type) {
        case 'image':
          document.title = 'search page ' + page
          break
        case 'comic':
          document.title = 'comics page ' + page
          break
        default:
          document.title = 'search page ' + page
      }
    }
    else {
      switch (type) {
        case 'image':
          document.title = tags + ', page ' + page
          break
        case 'comic':
          document.title = 'comics page ' + page
          break
        default:
          document.title = 'comics: ' + tags + ', page ' + page
      }

    }
  }