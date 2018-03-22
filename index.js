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
                builder.CardAction.imBack(session, "Press 8", "Press 8"),
                builder.CardAction.imBack(session, "Press 7", "Press 7"),
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


bot.dialog('Elevator_Does_Not_Move', session => {

    session.send(`
        **DEAD**
    `)

}).triggerAction({
    matches: 'Elevator_Does_Not_Move'
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