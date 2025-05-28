const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1';

export const fetchBooksByCategory = async (category, pageToken = null) => {
  try {
    const url = new URL(`${GOOGLE_BOOKS_API_BASE_URL}/volumes`);
    url.searchParams.append('q', `subject:${category}`);
    url.searchParams.append('maxResults', '10');
    url.searchParams.append('key', 'AIzaSyAJPdeFDmJ6MHRZghQ38YvQ32o2xwchbiw');
    
    if (pageToken) {
      url.searchParams.append('startIndex', pageToken);
    }

    const response = await fetch(url.toString());
    const data = await response.json();
    
    return {
      books: data.items || [],
      nextPageToken: data.items?.length === 10 ? (pageToken || 0) + 10 : null
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    return {
      books: [],
      nextPageToken: null
    };
  }
};

export const categories = [
  'fiction',
  'science',
  'fairytales',
  'adventure',
  'fantasy',
  'mystery',
  'biography',
  'history'
]; 