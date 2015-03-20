requirejs( [ 'require-config' ], function( rc ) {
    requirejs( [ 'jquery', 'Modernizr', 'enketo-js/Form', 'file-manager' ],
        function( $, Modernizr, Form, fileManager ) {
            var loadErrors, form, formStr, modelStr;

            //if querystring touch=true is added, override Modernizr
            if ( getURLParameter( 'touch' ) === 'true' ) {
                Modernizr.touch = true;
                $( 'html' ).addClass( 'touch' );
            }

            //check if HTML form is hardcoded or needs to be retrieved
            if ( getURLParameter( 'xform' ) !== 'null' ) {
                $( '.guidance' ).remove();
                $.get( 'http://xslt-dev.enketo.org/?xform=' + getURLParameter( 'xform' ), function( data ) {
                    var $data;
                    //this replacement should move to XSLT after which the GET can just return 'xml' and $data = $(data)
                    data = data.replace( /jr\:template=/gi, 'template=' );
                    $data = $( $.parseXML( data ) );
                    formStr = ( new XMLSerializer() ).serializeToString( $data.find( 'form:eq(0)' )[ 0 ] );
                    modelStr = ( new XMLSerializer() ).serializeToString( $data.find( 'model:eq(0)' )[ 0 ] );
                    $( '.form-header' ).after( formStr );
                    initializeForm();
                }, 'text' );
            } else if ( $( 'form.or' ).length > 0 ) {
                $( '.guidance' ).remove();
                modelStr = globalModelStr;
                initializeForm();
            }

            //validate handler for validate button
            $( '#validate-form' ).on( 'click', function() {
                form.validate();
                if ( !form.isValid() ) {
                    alert( 'Form contains errors. Please see fields marked in red.' );
                } else {
                    alert( 'Form is valid! (see XML record and media files in the console)' );
                    console.log( 'record:', form.getDataStr() );
                    console.log( 'media files:', fileManager.getCurrentFiles() );
                }
            } );

            //initialize the form
            function initializeForm() {
                form = new Form( 'form.or:eq(0)', {
                    modelStr: modelStr
                } );
                //for debugging
                window.form = form;
                //initialize form and check for load errors
                loadErrors = form.init();
                if ( loadErrors.length > 0 ) {
                    alert( 'loadErrors: ' + loadErrors.join( ', ' ) );
                }
            }

            //get query string parameter
            function getURLParameter( name ) {
                return decodeURI(
                    ( new RegExp( name + '=' + '(.+?)(&|$)' ).exec( location.search ) || [ null, null ] )[ 1 ]
                );
            }
        } );
} );
