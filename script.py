from flask import Flask, jsonify, request
from newspaper import Article
from GoogleNews import GoogleNews
import datetime
import pandas as pd
import nltk
from serpapi import GoogleSearch
import requests
import json
# import openai
from openai import OpenAI
import os

app = Flask(__name__)

import requests

# Load your OpenAI API key from an environment variable for security
# openai.api_key = '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'
#os.getenv('OPENAI_API_KEY')

client = OpenAI(api_key='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')

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

@app.route('/get_articles', methods=['POST'])
def get_articles():
    data = request.get_json()
    urls = data.get('urls', [])
    
    print(f"Starting to process {len(urls)} articles...")

    articles_list = []
    for url in urls:
        try:
            article = Article(url)
            article.download()
            article.parse()
            # Classify the article
            tags = classify_article(article.text, categories)
            
            print(f"Processing URL: {url}")
            articles_list.append({
                'title': article.title,
                'text': article.text[:300],
                'content': article.text,
                'url': url,
                'publish_date': article.publish_date.isoformat() if article.publish_date else 'Unknown',
                'source': article.source_url,
                'tags': tags  # Add classified tags to the article info
            })
        except Exception as e:
            print(f"Failed to process {url}: {str(e)}")
    
    print(f"Total articles processed: {len(articles_list)}")
    return jsonify(articles_list)

@app.route('/call_ai', methods=['POST'])
def call_openai():
    data = request.json
    user_input = data.get('input')  # User's input
    article_text = data.get('articleText')  # Article text to be included

    if not user_input or not article_text:
        return jsonify({'error': 'No user input or article text provided'}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a chatbot that answers the user's questions about the article by analyzing its text and using your knowledge. Here is the article text: {article_text}"},
                {"role": "assistant", "content": article_text},  # Include the article text as part of the assistant's knowledge
                {"role": "user", "content": user_input}
            ]
        )

        print(response.choices[0].message.content)

        return jsonify({'response': response.choices[0].message.content.strip()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(debug=True, port=8080)
