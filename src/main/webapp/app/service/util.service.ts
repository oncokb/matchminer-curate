// @Injectable()
// export class UtilService {

// 	/**
// 	 * Copy from Oncokb
//      * Util to send email systematically
//      * @param {string} sendTo The recipient
//      * @param {string} subject The email subject
//      * @param {string} content The email content
//      * @return {*|h.promise|promise|r.promise|d.promise} Promise
//     * */
//     sendEmail(sendTo, subject, content) {
//         var deferred = $q.defer();
//         var param = {sendTo: sendTo, subject: subject, content: content};
//         DatabaseConnector.sendEmail(
//             param,
//             function(result) {
//                 deferred.resolve(result);
//             },
//             function(result) {
//                 deferred.reject(result);
//             }
//         );
//         return deferred.promise;
//     }

// }