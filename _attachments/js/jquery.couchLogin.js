// Copyright Chris Anderson 2011
// Apache 2.0 License
// jquery.couchLogin.js
// 
// Example Usage (loggedIn and loggedOut callbacks are optional): 
//    $("#mylogindiv").couchLogin({
//        loggedIn : function(userCtx) {
//            alert("hello "+userCtx.name);
//        }, 
//        loggedOut : function() {
//            alert("bye bye");
//        }
//    });

(function($) {
    $.fn.couchLogin = function(opts) {
        var elem = $(this);
        opts = opts || {};
        function initWidget() {
            $.couch.session({
                success : function(r) {
                    var userCtx = r.userCtx;
                    if (userCtx.name) {
                        elem.empty();
                        elem.append(loggedIn(r));
                        if (opts.loggedIn) {opts.loggedIn(userCtx)}
                    } else if (userCtx.roles.indexOf("_admin") != -1) {
                        elem.html(templates.adminParty);
                    } else {
                        elem.html(templates.loggedOut);
                        if (opts.loggedOut) {opts.loggedOut()}
                    };
                }
            });
        };
        initWidget();
        function doLogin(name, pass) {
            $.couch.login({name:name, password:pass, success:initWidget});
        };
        elem.delegate("a[href=#signup]", "click", function() {
            elem.html(templates.signupForm);
            elem.find('input[name="name"]').focus();
        });
        elem.delegate("a[href=#login]", "click", function() {
            elem.html(templates.loginForm);
            elem.find('input[name="name"]').focus();
        });
        elem.delegate("a[href=#logout]", "click", function() {
            $.couch.logout({success : initWidget});
        });
        elem.delegate("form.login", "submit", function() {
            doLogin($('input[name=name]', this).val(),  
                $('input[name=password]', this).val());
            return false;
        });
        elem.delegate("form.signup", "submit", function() {
            var name = $('input[name=name]', this).val(),  
                pass = $('input[name=password]', this).val();
            $.couch.signup({name : name}, pass, {
                success : function() {doLogin(name, pass)}
            });
            return false;      
        });
    }
    var templates = {
        adminParty : '<p><strong>Admin party, everyone is admin!</strong> Fix this in <a href="/_utils/index.html">Futon</a> before proceeding.</p>',
        loggedOut : '<ul class="nav navbar-nav navbar-right"><li><a href="#login">Login</a></li></ul>',
        loginForm : '<form class="login navbar-form navbar-right" role="form"><div class="form-group"><input type="text" name="name" value="" autocapitalize="off" autocorrect="off" placeholder="Username" class="form-control"></div> <div class="form-group"><input type="password" name="password" value="" placeholder="Password"  class="form-control"></div> <button type="submit" class="btn btn-primary">Log In</button>'
    };
    function loggedIn(r) {
        var auth_db = encodeURIComponent(r.info.authentication_db)
        , uri_name = encodeURIComponent(r.userCtx.name)
        , span = $('<ul class="nav navbar-nav navbar-right"><li><a target="_new" class="name">Logged in as ' + r.userCtx.name + '</a></li><li><a href="#logout">Logout?</a></li></ul>');
        return span;
    }
})(jQuery);