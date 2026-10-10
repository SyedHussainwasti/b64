// ==APP-LOGIC-START==

// Turns text into base64. Handles emoji and non-English text correctly.
// If urlSafe is true, uses the URL-safe alphabet (-_ and no padding).
function b64encode(str, urlSafe){
  // Turn the text into UTF-8 bytes first (this is what makes emoji work).
  var bytes = new TextEncoder().encode(str);
  var bin = ''; // will hold the bytes as a plain string
  var CHUNK = 0x8000; // work in chunks so huge texts don't crash the browser
  // Convert each chunk of bytes into characters.
  for(var i=0; i<bytes.length; i+=CHUNK){
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i+CHUNK));
  }
  var out = btoa(bin); // the browser's built-in base64 encoder
  // URL-safe mode: swap +/ for -_ and drop the = padding.
  if(urlSafe){ out = out.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  return out; // hand back the base64 text
}

// Turns base64 back into text. Throws a clear error if the input is invalid.
function b64decode(input, urlSafe){
  var s = String(input).replace(/\s/g,''); // ignore any spaces/line breaks
  // URL-safe mode: swap -_ back to +/ before decoding.
  if(urlSafe){ s = s.replace(/-/g,'+').replace(/_/g,'/'); }
  if(s.length===0) return ''; // empty input gives empty output
  // Reject anything that isn't proper base64 (wrong characters or wrong length).
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length%4!==0){
    throw new Error('Invalid Base64: bad characters or bad length.');
  }
  var bin; // will hold the decoded bytes as a plain string
  try{ bin = atob(s); } // the browser's built-in base64 decoder
  catch(e){ throw new Error('Invalid Base64: could not decode.'); }
  // Turn the string back into real bytes.
  var bytes = new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++){ bytes[i]=bin.charCodeAt(i); }
  // Turn the bytes back into text. Fatal mode means bad UTF-8 throws
  // instead of silently turning into garbage.
  try{ return new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
  catch(e){ throw new Error('Invalid Base64: not valid UTF-8.'); }
}
// ==APP-LOGIC-END==

// Everything below only runs in a browser (not when testing the logic in Node).
if(typeof document!=='undefined'){
  // Grab the page pieces: the input box, output box, checkbox, and message line.
  var inEl=document.getElementById('in');
  var outEl=document.getElementById('out');
  var urlSafeEl=document.getElementById('urlSafe');
  var msgEl=document.getElementById('msg');
  // Shows a message under the buttons. cls is 'ok' (green) or 'err' (red).
  function setMsg(t, cls){ msgEl.textContent=t; msgEl.className=cls||''; }
  // Encode button: encode the input and show the result.
  document.getElementById('encBtn').addEventListener('click',function(){
    try{ outEl.value=b64encode(inEl.value, urlSafeEl.checked); setMsg('Encoded.','ok'); }
    catch(e){ setMsg(e.message,'err'); } // show the error instead of crashing
  });
  // Decode button: decode the input and show the result.
  document.getElementById('decBtn').addEventListener('click',function(){
    try{ outEl.value=b64decode(inEl.value, urlSafeEl.checked); setMsg('Decoded.','ok'); }
    catch(e){ outEl.value=''; setMsg(e.message,'err'); } // clear output on error
  });
  // Copy button: copy the output to the clipboard.
  document.getElementById('copyBtn').addEventListener('click',function(){
    var v=outEl.value; // the text to copy
    if(!v){ setMsg('Nothing to copy yet.','err'); return; } // nothing there? say so
    // Use the modern clipboard tool if the browser has it...
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(v).then(
        function(){setMsg('Copied to clipboard.','ok');}, // it worked
        function(){setMsg('Copy failed — select the text manually.','err');}); // it failed
    }else{
      // ...otherwise fall back to selecting the output box and copying.
      outEl.select();
      try{document.execCommand('copy'); setMsg('Copied to clipboard.','ok');}
      catch(e){setMsg('Copy failed — select the text manually.','err');}
    }
  });
}
