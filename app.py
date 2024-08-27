import os
import requests
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

app = Flask(__name__)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

headers = {
    'Authorization': f'token {GITHUB_TOKEN}'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats', methods=['GET'])
def get_github_stats():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "No username provided"}), 400

    user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers)
    if user_data.status_code != 200:
        return jsonify({"error": user_data.json().get('message', 'User not found')}), user_data.status_code

    user_data = user_data.json()

    repos_data = requests.get(f'https://api.github.com/users/{username}/repos', headers=headers)
    if repos_data.status_code != 200:
        return jsonify({"error": repos_data.json().get('message', 'Repos not found')}), repos_data.status_code

    repos_data = repos_data.json()

    languages_count = {}
    repos_info = []
    stars_count = []
    forks_count = []

    for repo in repos_data:
        repos_info.append({
            "name": repo["name"],
            "description": repo["description"] or "Sin descripción",
            "stars": repo["stargazers_count"],
            "forks": repo["forks_count"],
            "issues": repo["open_issues_count"],
            "url": repo["html_url"]
        })

        stars_count.append(repo["stargazers_count"])
        forks_count.append(repo["forks_count"])

        languages_data = requests.get(repo["languages_url"], headers=headers)
        if languages_data.status_code == 200:
            languages = languages_data.json()
            for language in languages.keys():
                if language in languages_count:
                    languages_count[language] += 1
                else:
                    languages_count[language] = 1

    return jsonify({
        "user": {
            "name": user_data["name"] or user_data["login"],
            "avatar_url": user_data["avatar_url"],
            "bio": user_data["bio"] or "Sin biografía disponible",
            "followers": user_data["followers"],
            "following": user_data["following"],
            "public_repos": user_data["public_repos"]
        },
        "repos": repos_info,
        "languages": languages_count,
        "stars_count": stars_count,
        "forks_count": forks_count
    })

if __name__ == '__main__':
    app.run(debug=True)
