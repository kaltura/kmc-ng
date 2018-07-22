import { KalturaLiveStreamEntry } from 'kaltura-ngx-client';
import { KalturaSourceType } from 'kaltura-ngx-client';
import { KalturaLiveStreamBitrate } from 'kaltura-ngx-client';

export class LiveXMLExporter
{
	static exportXML(entry: KalturaLiveStreamEntry, liveType: string, customBitrates: any[]) {
		const xmlString =
			`<flashmedialiveencoder_profile>
                <preset>
                    <name>Custom</name>
                    <description></description>
                </preset>
                <capture>
                    <video>
                        <device></device>
                        <crossbar_input>0</crossbar_input>
                        <frame_rate></frame_rate>
                        <size>
                            <width></width>
                            <height></height>
                        </size>
                    </video>
                    <audio>
                        <device></device>
                        <crossbar_input>0</crossbar_input>
                        <sample_rate></sample_rate>
                        <channels>2</channels>
                        <input_volume>75</input_volume>
                    </audio>
                </capture>
                <encode>
                    <video>
                        <format></format>
                        <datarate></datarate>
                        <outputsize></outputsize>
                        <advanced>
                            <profile></profile>
                            <level></level>
                            <keyframe_frequency></keyframe_frequency>
                        </advanced>
                        <autoadjust>
                            <enable></enable>
                            <maxbuffersize></maxbuffersize>
                            <dropframes>
                                <enable></enable>
                            </dropframes>
                            <degradequality>
                                <enable></enable>
                                <minvideobitrate></minvideobitrate>
                                <preservepfq></preservepfq>
                            </degradequality>
                        </autoadjust>
                    </video>
                    <audio>
                        <format></format>
                        <datarate></datarate>
                    </audio>
                </encode>
                <restartinterval>
                    <days></days>
                    <hours></hours>
                    <minutes></minutes>
                </restartinterval>
                <reconnectinterval>
                    <attempts></attempts>
                    <interval></interval>
                </reconnectinterval>
                <output>
                    <rtmp>
                        <url></url>
                        <backup_url></backup_url>
                        <stream></stream>
                    </rtmp>
                </output>
                <metadata/>
                <preview>
                    <video>
                        <input>
                            <zoom>100%</zoom>
                        </input>
                        <output>
                            <zoom>100%</zoom>
                        </output>
                    </video>
                    <audio></audio>
                </preview>
                <log>
                    <level>100</level>
                    <directory></directory>
                </log>
            </flashmedialiveencoder_profile>`;
		const parser = new DOMParser();
		let xml = parser.parseFromString(xmlString, "text/xml");
		// assign outputs
		xml.getElementsByTagName("url")[0].appendChild(xml.createTextNode(entry.primaryBroadcastingUrl));
		xml.getElementsByTagName("backup_url")[0].appendChild(xml.createTextNode(entry.secondaryBroadcastingUrl));
		xml.getElementsByTagName("stream")[0].appendChild(xml.createTextNode(entry.streamName));
		// assign bitrates
		let bitratesString = "";
		let dimensionsStrings = "";
		let bitrates: KalturaLiveStreamBitrate[] = [];
		if (liveType === "kaltura") {
			bitrates = entry.bitrates;
		} else if (liveType === "universal") {
			customBitrates.forEach (br => {
				if (br.enabled) {
					bitrates.push(new KalturaLiveStreamBitrate({
						bitrate: br.bitrate,
						width: br.width,
						height: br.height
					}));
				}
			});
		}
		bitrates.forEach((br: KalturaLiveStreamBitrate) => {
			bitratesString += br.bitrate.toString() + ";";
			dimensionsStrings += br.width.toString() + "x" + br.height.toString() + ";";
		});
		const encode = xml.getElementsByTagName("encode")[0];
		const video = encode.getElementsByTagName("video")[0];
		const audio = encode.getElementsByTagName("audio")[0];
		video.getElementsByTagName("datarate")[0].appendChild(xml.createTextNode(bitratesString));
		video.getElementsByTagName("outputsize")[0].appendChild(xml.createTextNode(dimensionsStrings));
		audio.getElementsByTagName("format")[0].appendChild(xml.createTextNode("MP3"));
		audio.getElementsByTagName("datarate")[0].appendChild(xml.createTextNode("128"));
		// additional
		if (entry.sourceType.toString() === KalturaSourceType.liveStream.toString() || entry.sourceType.toString() === KalturaSourceType.akamaiUniversalLive.toString()) {
			video.getElementsByTagName("format")[0].appendChild(xml.createTextNode("H.264"));
			video.getElementsByTagName("advanced")[0].getElementsByTagName("profile")[0].appendChild(xml.createTextNode("Baseline"));
			video.getElementsByTagName("advanced")[0].getElementsByTagName("level")[0].appendChild(xml.createTextNode("3.1"));
			video.getElementsByTagName("advanced")[0].getElementsByTagName("keyframe_frequency")[0].appendChild(xml.createTextNode("2 seconds"));
			xml.getElementsByTagName("capture")[0].getElementsByTagName("audio")[0].getElementsByTagName("sample_rate")[0].appendChild(xml.createTextNode("44100"));
		}
		return (new XMLSerializer()).serializeToString(xml);
	}
}
