# Documentation Quiz

Please visit the [docs](https://semesterly-v2.readthedocs.io/en/latest/index.html) and
answer the following questions.

1. What is the command I run to get the courses from Fall 2021?
A: python manage.py ingest jhu --years 2021 --terms Fall

2. How do I then load those courses into my database?
A: python manage.py digest jhu

3. How do I get a terminal running in my docker container?
A: Right click -> "Attach Shell"

4. Where do I store data such as passwords or secrets that I don’t want to commit?
A: semesterly/sensitive.py as it is automaticallt git-ignored. Should have format equivalent to semesterly/dev_credentials.py with a "SECRETS" list

5. What branch do I create a new branch off of when developing?
A: develop

6. If I want to start on a feature called myfeature, what should the branch name be?
A: feature/your-branch-name

7. What is the preferred format for commit messages?
A: “Topic: Message”

8. What linters do we run against our code?
A: npx prettier "**/*.{js,jsx,ts,tsx}" --write, eslint . --ext .js,.jsx,.ts,.tsx --fix, black .

9. What is a FeatureFlowView?
A: Handles request when a user loads the home timetable page


When you are done answering the questions, create a PR for a discussion of your answers.