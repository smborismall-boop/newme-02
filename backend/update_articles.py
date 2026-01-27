"""
Update existing articles dengan HTML content dan featured images
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def update_articles():
    try:
        print("🔄 Updating articles with proper HTML and images...")
        
        # Get all articles
        articles = await db.articles.find({}).to_list(length=100)
        
        for article in articles:
            # Convert markdown-style to HTML
            content = article.get('content', '')
            
            # Simple markdown to HTML conversion
            content = content.replace('# ', '<h1>').replace('\n\n', '</h1>\n')
            content = content.replace('## ', '<h2>').replace('\n', '</h2>\n', 1)
            content = content.replace('**', '<strong>').replace('**', '</strong>')
            content = content.replace('- ', '<li>').replace('\n', '</li>\n')
            
            # Wrap paragraphs
            lines = content.split('\n')
            html_content = []
            in_list = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    if in_list:
                        html_content.append('</ul>')
                        in_list = False
                    continue
                    
                if line.startswith('<h'):
                    if in_list:
                        html_content.append('</ul>')
                        in_list = False
                    html_content.append(line)
                elif line.startswith('<li>'):
                    if not in_list:
                        html_content.append('<ul>')
                        in_list = True
                    html_content.append(line)
                else:
                    if in_list:
                        html_content.append('</ul>')
                        in_list = False
                    if not line.startswith('<'):
                        html_content.append(f'<p>{line}</p>')
                    else:
                        html_content.append(line)
            
            if in_list:
                html_content.append('</ul>')
            
            # Assign featured images based on slug
            featured_image = None
            slug = article.get('slug', '')
            
            if '5-elemen' in slug or 'elemen-kepribadian' in slug:
                featured_image = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=400&fit=crop'
            elif 'introvert' in slug or 'extrovert' in slug:
                featured_image = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop'
            elif 'minat' in slug or 'holland' in slug:
                featured_image = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop'
            elif 'kecerdasan' in slug or 'gardner' in slug:
                featured_image = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop'
            elif 'karir' in slug:
                featured_image = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop'
            
            # Update article
            await db.articles.update_one(
                {'_id': article['_id']},
                {
                    '$set': {
                        'content': '\n'.join(html_content),
                        'featuredImage': featured_image
                    }
                }
            )
            print(f"✅ Updated: {article.get('title', 'Unknown')}")
        
        print(f"\n🎉 Updated {len(articles)} articles successfully!")
        
    except Exception as e:
        print(f"❌ Error updating articles: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(update_articles())
