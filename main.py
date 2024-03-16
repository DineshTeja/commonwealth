from flask import Flask, jsonify, request
from newspaper import Article
import pandas as pd
import nltk
import requests
import json
# import openai
# from openai import OpenAI
import openai
import os
import argparse
import requests
import functions_framework

# Load your OpenAI API key from an environment variable for security
openai.api_key = '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'
#os.getenv('OPENAI_API_KEY')

# client = OpenAI(api_key='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')

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


@functions_framework.http
def get_articles(request):
    request_json = request.get_json(silent=True)
    if request_json is None:
        # Handle the case where there is no valid JSON in the request
        return json.dumps({'error': 'No JSON payload found'}), 400, {'Content-Type': 'application/json'}
    
    urls = request_json.get('urls', [])
    
    articles_list = []
    for url in urls:
        try:
            article = Article(url)
            article.download()
            article.parse()
            tags = classify_article(article.text, categories)
            
            articles_list.append({
                'title': article.title,
                'text': article.text[:300],
                'content': article.text,
                'url': url,
                'publish_date': article.publish_date.isoformat() if article.publish_date else 'Unknown',
                'source': article.source_url,
                'tags': tags
            })
        except Exception as e:
            print(f"Failed to process {url}: {str(e)}")
    
    return json.dumps(articles_list), 200, {'Content-Type': 'application/json'}

# @functions_framework.http
# def call_openai(request):
#     request_json = request.get_json(silent=True)
#     user_input = request_json.get('input')
#     article_text = request_json.get('articleText')

#     if not user_input or not article_text:
#         return json.dumps({'error': 'No user input or article text provided'}), 400

#     try:
#         client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "system", "content": f"You are a chatbot that answers the user's questions about the article by analyzing its text and using your knowledge. Here is the article text: {article_text}"},
#                 {"role": "assistant", "content": article_text},
#                 {"role": "user", "content": user_input}
#             ]
#         )

#         return json.dumps({'response': response.choices[0].message.content.strip()}), 200, {'Content-Type': 'application/json'}
#     except Exception as e:
#         return json.dumps({'error': str(e)}), 500

@functions_framework.http
def call_openai(request):
    request_json = request.get_json(silent=True)
    user_input = request_json.get('input', '')
    article_text = request_json.get('articleText', '')

    if not user_input or not article_text:
        return json.dumps({'error': 'No user input or article text provided'}), 400

    try:
        # Set the OpenAI API key from an environment variable
        openai.api_key = os.getenv('OPENAI_API_KEY')

        # Create a chat completion request to OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a chatbot that answers the user's questions about the article by analyzing its text and using your knowledge. Here is the article text: {article_text}"},
                {"role": "assistant", "content": article_text},
                {"role": "user", "content": user_input}
            ]
        )

        # Extract the response content and return it
        return json.dumps({'response': response.choices[0].message['content'].strip()}), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return json.dumps({'error': str(e)}), 500