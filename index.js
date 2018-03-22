// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var spellService = require('./spell-service');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    if (!session.privateConversationData.state) {
        session.privateConversationData.state = {
            stage: "StartGame",
            level: 8,
            objects: []
        };
    }

    session.beginDialog('Start_Eight_Floor');
});


// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('Start_Eight_Floor', function (session, args) {

    let msg = new builder.Message(session)
        .text(`
            You are now on the 8th Floor and you hear disgusting noises,
            you look around you and discover that the building has become infested with shambling and decaying zombies.

            What do you want to do?
        `)
        .suggestedActions(builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "Run to the stairs", "Run to the stairs"),
                builder.CardAction.imBack(session, "Run to the elevator", "Run to the elevator"),
                builder.CardAction.imBack(session, "Take the card", "Take the card")
            ]
        ));

    session.send(msg);

    // - Expectation
    // : Run to the stairs;    =Stairs_Eight_Floor
    // : Run to the elevator;  =Elevator_Open
    // : Take the card;        =Take_Card

}).triggerAction({
    matches: 'Start_Eight_Floor'
});

bot.dialog('Elevator_Open', function(session) {

    let msg = new builder.Message(session)
        .text(`
            You call the elevator, while waiting the noises become more and more aggressive. You hear the familiar voice of the elevator call and the doors opens.
            You remember that the elevator could not go to the floors below 6th.

            Which floor do you go to?
        `)
        .suggestedActions(builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "Go to eight floor", "Go to eight floor"),
                builder.CardAction.imBack(session, "Go to seventh floor", "Go to seventh floor"),
                builder.CardAction.imBack(session, "Press Any", "Press Any")
            ]
        ));

    session.send(msg);

    // - Expectations
    // : Press 8;              =Elevator_Does_Not_Move
    // : Press 7;              =Go_Floor_Seven
    // : Press Any;            =Elevator_Fall_Death

}).triggerAction({
    matches: 'Elevator_Open'
});


bot.dialog('Elevator_Does_Not_Move', function(session) {
    session.send(`**DEAD**`);
}).triggerAction({
    matches: 'Elevator_Does_Not_Move'
});

bot.dialog('Elevator_Fall_Death', function(session) {
    session.send(`**DEAD**`);

}).triggerAction({
    matches: 'Elevator_Fall_Death'
});

bot.dialog('Go_Floor_Seven', function(session) {


    let msg = new builder.Message(session)
        .text(`
            You call the elevator, while waiting the noises become more and more aggressive. You hear the familiar voice of the elevator call and the doors opens.
            You remember that the elevator could not go to the floors below 6th.

            Which floor do you go to?
        `)
        .suggestedActions(builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "Take extiguisher", "Take extiguisher"),
                builder.CardAction.imBack(session, "Take calculator", "Take calculator"),
                builder.CardAction.imBack(session, "Take both", "Take both"),
                builder.CardAction.imBack(session, "Panic and Die", "Panic and Die")
            ]
        ));

    session.send(msg);

    // - Expectation
    // : take extiguisher;     =Take_Extinguisher
    // : take calculator;      =Take_Calculator
    // : take both;            =Take_Both_Weapons
    // : Panic and Die;        =Jump_Death

}).triggerAction({
    matches: 'Go_Floor_Seven'
});

bot.dialog('Take_Extinguisher', function(session) {

    let msg = new builder.Message(session)
        .text(`
            You grab the extinguisher but the path to you right is blocked by a pile of dead bodies,
            that where probably trying to escape. Some of them are beginning to move, the door infront of
            you is unlocked and you run into it!
        `)
        .suggestedActions(builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "Throw extinguisher", "Throw extinguisher"),
                builder.CardAction.imBack(session, "Do nothing", "Do nothing"),
                builder.CardAction.imBack(session, "Take both", "Take both"),
                builder.CardAction.imBack(session, "Panic and Die", "Panic and Die")
            ]
        ));

session.send(msg);

    // - Expectation
    // : take extiguisher;     =Take_Extinguisher
    // : take calculator;      =Take_Calculator
    // : take both;            =Take_Both_Weapons
    // : Panic and Die;        =Jump_Death

}).triggerAction({
    matches: 'Go_Floor_Seven'
});


bot.dialog('Take_Card', function (session, args) {

    if (session.privateConversationData.state.level === 8) {
        session.privateConversationData.state.objects.push("card");

        let msg = new builder.Message(session)
        .text(`
            You took the card.

            What do you want to do?
        `)
        .suggestedActions(builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "Run to the stairs", "Run to the stairs"),
                builder.CardAction.imBack(session, "Run to the elevator", "Run to the elevator"),
            ]
        ));

    session.send(msg);
    } else {
        session.send("You can't do that!");
    }

}).triggerAction({
    matches: 'Take_Card'
});

bot.dialog('Start_Fourth_Third_Floor', function (session, args) {

        let msg = new builder.Message(session)
        .text(`
            The 5th floor was hard enough but you manage to reach the 4th floor. You are fortunate to be close enough to the internal stairs of the 4th floor to the 3rd. Though you see from distance the CEO's office empty, full of food and some weapons.

            What do you do?
        `)
        .suggestedActions(builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "Go to CEO room", "Go to CEO room"),
                builder.CardAction.imBack(session, "Go to stairs", "Go to stairs"),
            ]
        ));

    session.send(msg);

}).triggerAction({
    matches: 'Start_Fourth_Third_Floor'
});

bot.dialog('CEO_Death', function (session, args) {

        let msg = new builder.Message(session)
        .text(`
        You carefully manage to enter CEO's office and you reach for the food where you are met with an angry Zombie CEO that fires you and then feast on your warm body!

        You die!
        `);

    session.send(msg);

}).triggerAction({
    matches: 'CEO_Death'
});

bot.dialog('Help', function (session, args) {
    session.endDialog('Hi! Try asking me things like \'search hotels in Seattle\', \'search hotels near LAX airport\' or \'show me the reviews of The Bot Resort\'');
}).triggerAction({
    matches: 'Help'
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    console.log('Text corrected to "' + text + '"');
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}

// Helpers
function addGifWithOptions(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}

function reviewAsAttachment(review) {
    return new builder.ThumbnailCard()
        .title(review.title)
        .text(review.text)
        .images([new builder.CardImage().url(review.image)]);
}