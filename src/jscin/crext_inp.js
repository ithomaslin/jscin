// Copyright 2013 Google Inc. All Rights Reserved.

/**
 * @fileoverview ChromeExtension-based Input Method Module
 * @author hungte@google.com (Hung-Te Lin)
 */

jscin.register_module('CrExtInp', jscin.extend_input_method({

  constructor: function (name, conf)
  {
    jscin.log("CrExtInp", name, conf);
    var self = this;
    self.opts = {
      OPT_LOWERCASE: conf.LOWERCASE
    };
    self.extension_id = conf.EXTENSION_ID;

    // TODO(hungte) Move the IM protocol to standalone JS.

    // Jscin IM protocol v1: (jscin/crext_inip.js)
    //  jscin->im: {type: 'jscin_im_v1', key: <key>}
    //  im->jscin: {type: 'jscin_im_v1, im: <context> }
    self.kJscinType = 'jscin_im_v1';
    self.kJscinKeyName = 'key';
    self.kJscinImName = 'im';

    chrome.runtime.onMessageExternal.addListener(
        function (request, sender, senderResponse) {
          if (sender.id != self.extension_id)
            return;
          if (request.type != self.kJscinType)
              return;
          var data = request[self.kJscinImName];
          jscin.log("crext_inp received", data);
          self.ctx.keystroke = data.keystroke || '';
          self.ctx.mcch = data.mcch || '';
          self.ctx.cch = data.cch || '';
          self.ctx.lcch = data.lcch || [];
          self.ctx.edit_pos = data.edit_pos;
          self.notify();
        });
  },

  keystroke: function (ctx, ev)
  {
    var self = this;
    var k = jscin.get_key_val(ev.code);
    if (self.opts.OPT_LOWERCASE && k.length == 1)
      k = k.toLowerCase();

    jscin.log("CrExt: key = ", k);
    // TODO(hungte) keystroke should be handled in ext side.
    chrome.runtime.sendMessage(self.extension_id, {
      type: self.kJscinType,
      key: k});

    // TODO prevent race condition.
    self.ctx = ctx;
    return jscin.IMKEY_ABSORB;
  },

  get_accepted_keys: function (ctx)
  {
    // TODO(hungte) Add more?
    return this.parent.get_accepted_keys.call(this, ctx);
  }
}));
