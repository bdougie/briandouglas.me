import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get title and description from the URL query parameters
    const title = searchParams.get('title') || 'bdougie on the internet';
    const description = searchParams.get('description') || 'Personal blog and website of Brian Douglas';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontStyle: 'normal',
              color: '#C69749',
              marginBottom: 30,
              textAlign: 'center',
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 30,
                fontStyle: 'normal',
                color: '#E5E7EB',
                textAlign: 'center',
              }}
            >
              {description}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
