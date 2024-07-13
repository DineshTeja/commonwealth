import json
from newspaper import Article
from openai import OpenAI
from google.cloud import firestore
import functions_framework
import os
from flask import Flask, jsonify, render_template, request, make_response

app = Flask(__name__)

# openai.api_key = 'sk-proj-64bcNBxH5Y3YR2m5MMSbT3BlbkFJbV9JgHsDWoVlBJyOoR0r'

client = OpenAI(
  api_key='sk-proj-64bcNBxH5Y3YR2m5MMSbT3BlbkFJbV9JgHsDWoVlBJyOoR0r',
)

categories = {
    "Elections and Campaigns": ["election", "campaign", "vote", "ballot"],
    "Legislative Affairs": ["legislation", "law", "bill", "congress", "senate"],
    "Executive Branch": ["president", "executive", "administration"],
    "Judicial Matters": ["court", "judge", "legal", "justice"],
    "International Relations": ["international", "foreign", "diplomacy", "UN", "NATO"],
    "Defense and Security": ["defense", "military", "security", "armed forces"],
    "Economic Policy": ["economy", "economic", "finance", "budget"],
    "Health Policy": ["health", "medical", "disease", "vaccine"],
    "Environmental Policy": ["environment", "climate", "pollution", "sustainability"],
    "Education Policy": ["education", "school", "college", "university", "student"],
    "Social Issues": ["social", "society", "inequality", "welfare"],
    "Immigration": ["immigration", "migrant", "border", "asylum"],
    "Technology and Cybersecurity": ["technology", "cyber", "internet", "AI", "data"],
    "Transportation and Infrastructure": ["transportation", "infrastructure", "road", "bridge"],
    "Labor and Employment": ["labor", "employment", "work", "job", "unemployment"],
    "Trade and Tariffs": ["trade", "tariff", "import", "export"],
    "Political Scandals and Controversies": ["scandal", "controversy", "resign", "impeach"],
    "Public Opinion and Polls": ["opinion", "poll", "survey"],
    "Political Parties and Movements": ["party", "movement", "democrat", "republican"],
    "Historical and Analytical Perspectives": ["history", "analytical", "perspective", "study"]
}

from nltk.tokenize import word_tokenize
from collections import Counter

def classify_article(article_text, categories, num_tags=3):
    # Tokenize the article text
    tokens = word_tokenize(article_text.lower())
    token_counts = Counter(tokens)

    # Score categories based on keyword occurrences
    category_scores = {category: 0 for category in categories}
    for category, keywords in categories.items():
        for keyword in keywords:
            category_scores[category] += token_counts[keyword]

    # Sort categories by score and select the top 'num_tags'
    sorted_categories = sorted(category_scores, key=category_scores.get, reverse=True)
    top_categories = sorted_categories[:num_tags]

    # Filter categories with zero score
    final_categories = [category for category in top_categories if category_scores[category] > 0]

    return final_categories

def truncate_text(text, max_tokens=8192):
    # Tokenize the text and truncate to the maximum number of tokens
    tokens = word_tokenize(text)
    if len(tokens) > max_tokens:
        return ' '.join(tokens[:max_tokens])
    return text

@app.route('/get_articles', methods=['POST'])
def get_articles():
    try:
        data = request.get_json()
        urls = data.get('data', [])

        articles_list = []
        for url in urls:
            try:
                article = Article(url)
                article.download()
                article.parse()
                tags = classify_article(article.text, categories)

                truncated_text = truncate_text(article.text)

                embeddings = client.embeddings.create(
                    input=truncated_text,
                    model="text-embedding-3-large"
                ).data[0].embedding
                
                print(f"Processing URL: {url}")
                articles_list.append({
                    'title': article.title,
                    'text': article.text[:300],
                    'content': article.text,
                    'url': url,
                    'publish_date': article.publish_date.isoformat() if article.publish_date else 'Unknown',
                    'source': article.source_url,
                    'tags': tags,
                    'embeddings': embeddings
                })

            except Exception as e:
                print(f"Failed to process {url}: {str(e)}")
                continue 

        print(f"Total articles processed: {len(articles_list)}")
        return make_response(jsonify(articles_list), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)
        
if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(debug=True, port=5000)

