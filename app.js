// alert('Connected')
const API_NAME = "GET_HLS_STREAMING_SESSION_URL";
const PROTOCOL = 'HLS';

// Get button
const streamBtn = $('#stream-btn')

streamBtn.click(function () {
    console.log('button clicked')
})


// Get the stream sites API
const getStream = async () => {
    const { data } = await axios.get('https://devel.darwinist.io/streams')
    console.log(data)
    return {
        site1: data.site1[0],
        site2: data.site1[1]
    }
}

// getStream()
let data;

// Fetch credentials from AWS
const getCredentials = async () => {
    try {
        console.log('Fetching credentials')
        const { data } = await axios.get('https://master.darwinist.io/credentials')
        return data.credentials
    } catch (e) {
        console.log(e)
        throw e
    }
}

// getCredentials()

// Init Player
const initPlayer = (streamingSessionURLOne) => {
    const playerElement = $('#stream-one')
    playerElement.show()
    const player = videojs('stream-one', {
        autoPlay: true,
        muted: true
    })
    player.src({
        src: streamingSessionURLOne,
        type: 'application/x-mpegURL'
    })
    console.log('Video Player Started')
}

// Get init the streaming service
const initStreamingSession = async () => {
    const {site1} = await getStream()

    const options = await getCredentials()
   
    const kinesisVideo = new AWS.KinesisVideo(options);
    const kinesisVideoArchivedContent = new AWS.KinesisVideoArchivedMedia(options);

    let dataEndPoint;

    try {
        console.log('Fetching data endpoint');
        dataEndPoint = (await kinesisVideo.getDataEndpoint({
                StreamName: site1,
                APIName: API_NAME
            })
            .promise()).DataEndpoint;

        console.log(`Data endpoint: ${dataEndPoint}`)
    } catch (error) {
        console.log(error)
        throw error
    }

    kinesisVideoArchivedContent.endpoint = new AWS.Endpoint(dataEndPoint);

    let streamingSessionURLOne;

    try {
        console.log(`Fetching ${PROTOCOL} streaming session URL`);

        streamingSessionURLOne = (await kinesisVideoArchivedContent.getHLSStreamingSessionURL({
            StreamName: site1
        }).promise()).HLSStreamingSessionURL;

        console.log(`HLS Streaming Session URL: ${streamingSessionURLOne}`)

        return streamingSessionURLOne;
    } catch (error) {
        console.log(error)
        throw error
    }


}

// Play function
const playOne = async () => {
    const streamingSessionURLOne = await initStreamingSession()
    initPlayer(streamingSessionURLOne)
}

(async () => await playOne())();