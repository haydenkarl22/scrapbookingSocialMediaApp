To run our application, install the repository where you desire. In terminal, run npm install to install 
all necessary dependencies. After, you can run npm start. If you have any issues running this application, 
take a look at the package.json file to check and see if any of the dependencies listed are not packages 
you have installed, in which case you need to install them.


ScrapPages
The Peer-to-Peer Social Media Network
Hayden Karl, John Melulis, Nicholas Newbauer
Computer Science, Saint Louis University
1 North Grand Blvd
https://github.com/haydenkarl22/scrapbookingSocialMediaApp
hkarl2@slu.edu jmelulis@slu.edu nnewbauer@slu.edu 

Abstract -  ScrapPages is a social media platform developed in JavaScript using Firebase and React API. It uses a peer-to-peer architecture to handle chatting between friends, emphasizing the scalability and flexibility in the message size limits that this allows. ScrapPages’s distinguishing feature as a social media platform is the digital scrapbook, which can be customized with user-submitted content for a unique degree of self-expression.

INTRODUCTION

ScrapPages is a social media platform that is designed to be a scrapbook-sharing application where users can send their scrapbooks and directly message to their friends. The platform was designed so that users can express themselves in ways that no other social media offers, giving users the freedom to place images and captions wherever they want, not in just chronological order like other social media platforms. We have created this social media using a peer-to-peer paradigm, so sharing your scrapbook with the world is not the goal, rather just connecting with your friends one-on-one, making ScrapPages a far more intimate social media platform compared to others. Going hand-in-hand with this philosophy, the application harnesses the unique advantages of a peer-to-peer networking model to create a social media experience no other platform can replicate. The lack of a centralized server to handle chatting data allows users to control the message and file size limits sent in the chat, and the scalability of P2P architecture. 
ScrapPages is built off of Firebase and React API. Firebase is a backend cloud computing service that is used to handle the creation and storage of ScrapPages accounts. React API is a free, open-source JavaScript library that is used to implement the front end of the application, including the user interface and navigation tools. Though these tools were used to streamline the creation of the basic structure of the application, its features, including the scrapbook, chatting, and friends list, were programmed and implemented from scratch.


SYSTEM MODEL

Although account data is stored remotely via Firebase, the chat system uses Peer-to-Peer networking– when a chatroom is opened via the “Friends” page, two users can send messages back and forth, and when the conversation ends, the conversation is stored as a document in our Firebase database.

The displaying of account information in the chat UI, such as usernames and scrapbooks, is also handled using the same peer-to-peer system. The only times a host device interacts with the Firebase database is when they are initially accessing their account and making changes to their accounts, as well as when the conversation data needs to be pulled or stored. Otherwise, all processing is handled at the front end using the peer-to-peer architecture.

	When a chat room is closed, a document containing the message data is stored on the Firebase. This document is compiled and submitted to the remote database after chatting is complete and is pulled by the host device upon account access, so there is no real-time communication with the remote database during a chat session. 

ScrapPages has four main pages: “Home”, “Friends”, “My Profile”, and “Scrapbook”. On the “Home” page, ScrapPages displays your currently saved scrapbook, so long as you are logged in and you have already created a scrapbook on the “Scrapbook” page. 

On the “My Profile” page, if you are logged in, you can customize the way friends see your profile, with fields such as username and bio. You can also log out from the “My Profile” page, or delete your profile entirely. If you are not logged in, the “My Profile” screen becomes the login or sign-up screen, where you can either log in with your email and password or sign up by creating a username and password and linking it to your email address. 

The “Scrapbook” page is where users can customize their very own scrapbook. Pictures can be uploaded and text fields can be added, both of which can be moved, rotated, resized, and removed to your liking. Saving your scrapbook is done with the click of a button, once saved, friends can see your new scrapbook by sharing it with them, and your scrapbook is then displayed on your home screen. 




DEMONSTRATION
https://youtu.be/m31rjPPTcvY

This is the youtube link of us walking through or project.



EVALUATION
	Overall, when we set out to implement this idea, we were hoping we could effectively create an intimate social media platform that had an emphasis on sharing scrapbooks, and by all accounts we achieved our goal. This application is simple to use and does everything it needs to without feeling cluttered or functioning in a clunky way. We had hoped we could design the scrapbook to support the ability to create multiple pages, and while we may not have achieved this dream, the rest of our ambitious goals found their way to the program, like extensive authorization checking via Firebase’s authorization methods, as well as added the ability to send files, which include images, videos, and audio files that are larger than our competitors, such as Discord. Ultimately, we achieved the goal we set for ourselves, that being to design and test a peer-to-peer social media application with an emphasis on scrapbooking. 
CONTRIBUTION BREAKDOWN AND RETROSPECTIVE

The three members shared a fairly equal workload. Hayden did the entire peer-to-peer implementation, as well as some front-end logic, while John and Nick did most of the functionality, as well as all stylings for all of the pages and components.  Each contributor spent about thirty hours writing code, and about another fifteen hours each with debugging, contributing to roughly one hundred and thirty-five total hours spent. Many of our difficulties came from the chatroom functionality, as storing the chats and pulling from Firebase proved to be a far more difficult task than we set out for. Many bugs snowballed into a big issue with the chat function, so much so that we nearly scrapped peer-to-peer altogether and moved to a client-server paradigm. We ended up figuring out that the chat bugs were fairly complex and came from misconceptions that we had about Firebase itself. The group probably spent an additional 12 hours working on ways to resolve that issue. Even after that, we ran into a browser-side security error where when the scrapbook is reloaded, it is considered an external entity, which triggers a “canvas tainted” error that prevents the user form saving. This error was so massive it led us to install different canvas libraries to attempt to fix it, but ultimately, we had to scrap reloading previously designed scrappages, since to truly fix this, would have required us to scrap the fabric technology we used to design the scrapbook. The rest of ScrapPages worked out fairly straightforward, for all of us. React was something many of us had worked with in the past, so the platform was fairly easy, but implementing the peer-to-peer aspect was something we had never tried, so that proved to be a lot of a struggle for all of us. The group worked well as a team and had a very equal contribution all-in-all.




