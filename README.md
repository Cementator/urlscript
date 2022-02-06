Project : Parse text

This script parses text file or text input through command line, then searches for websites inside [] outermost brackets and returns JSON with the URL, name of the site and the first found email(encripted) for the given url.


Instructions to install script:


1. To clone script you have to download git for you PC. Or have it already installed with some IDE.
   Link: https://git-scm.com/downloads

Check if you have git with command: git --version

2. For this script you will need NODE js and NPM. Script was made with version 17.4.0.
   Download node: https://nodejs.org/en/
   Check your version of NODE and NPM to verify installation with commands in terminal:
   node -v
   npm -v

3. Clone the repository with HTTPS. Chose a directory you want this script installed in
   and enter this command in your terminal:
   git clone https://github.com/Cementator/urlscript.git

4. Once you have succesfully cloned the repository, navigate inside terminal to the directory of project called "urlscript".
   In windows command prompt to change directory type: cd urlscript

5.1. Now when you have succesfully navigated to urlscript directory, you will have to install packages with node package manager (NPM):
Type in terminal: npm install

5.2 After dependencies have been installed, we need to install script globally:
Type in terminal: npm install -g .

Now you are done with the installation and the script is ready.


Instructions for using script:

1. If you want to parse input from your terminal, just invoke script with command in terminal:
   parsetxt

Then type for example: [www.google.com]

And script returns name of site and email if there is any. To exit the script press CTRL + C.

2. If you want to parse a text, you have to navigate to the folder of the text and type:
   parsetxt <NAMEOFYOURFILE.txt>

You have example text file (test1.txt) inside urlscript directory and can type:
parsetxt test1.txt
