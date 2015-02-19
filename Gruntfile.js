module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // CSS minification
    cssmin : {
      theme : {
        src : [
          'public/css/bootstrap.css',
          'public/font-awesome/css/font-awesome.min.css',
          'public/css/main.css'
        ],
        dest : 'build/public/css/barcamp.min.css'
      }
    },
    // HTML minification
    htmlcompressor : {
      compile : {
        files : [{
            expand: true,
            src: '**/*.ejs',
            dest: 'build/views',
            cwd: 'views'
        }],
        options : {
          type: 'html',
          preserveServerScript: true
        }
      }
    },
    shell : {
    // Create a build folder based on public, remove the javascript/css
      createBuild : {
        command : 'rm -rf build; cp -R public build; rm -rf build/css/*.css build/js/*;'
      },
      copyArtifacts : {
        command : 'cp ./barcamp-server.js ./build/barcamp-server.js &&\n\
                   cp -r ./config ./build &&\n\
                   cp -r ./public/images ./build/public &&\n\
                   cp ./htaccess.conf ./build &&\n\
                   cp ./node_debian_init.sh ./build &&\n\
                   cp ./package.json ./build &&\n\
                   cp --parents ./public/js/vendor/jquery*min.js ./build'
      }, // TODO grunt-copy
      clean : {
        command : 'rm -rf ./build'
      },
      "clean-all" : {
        command : "rm barcamp.log && touch barcamp.log"
      },
      "start-debug" : {
        command : "node --debug-brk barcamp-server.js",
        options: {
          async: true
        }
      },
      "start-debugger" : {
        command : "node-inspector",
        options: {
          async: true
        }
      },
      "start" : {
        command : "sudo /etc/init.d/barcamp start"
      },
      "stop" : {
        command : "sudo /etc/init.d/barcamp stop"
      }
      
    },
    // Uglify JS
    uglify: {
      library: {
        files: [{
            expand: true,
            src: '**/*.js',
            dest: 'build/lib',
            cwd: 'lib'
        }]
      },
      'client-debug': {
        options: {
          beautify: true
        },
        files: {
          'build/public/js/barcamp.debug.js': 'build/public/js/barcamp.min.js'
        }
      }
    },
    minjson: {
      compile: {
        files:
          [{
            expand: true,
            src: '**/*.json',
            dest: 'build/lib',
            cwd: 'lib'
        }]
      }
    },
    min : {
      code : {
        'src' : [
          'public/js/require.js',
        ],
        dest : 'build/public/js/require.min.js'
      }
    },
    requirejs: {
      compile: {
        options: {
            name: "main",
            baseUrl: "public/js",
            mainConfigFile: "public/js/config.js",
            out: "build/public/js/barcamp.min.js"
        }
      }
    },
    git_deploy: {
      staging: {
        options: {
          url: 'user@production-server:barcamp.git',
          branch: 'release',
          massage: 'internal staged release'
        },
        src: 'build'
      },
    },
    clean: {
      options: {
        force: true
      },
      clean: ["build"]
    },
    jslint: {
      server: {
        src: [
          'lib/**/*.js'
        ],
        directives: {
          node: true,
          todo: true,
          indent: 2
        },
        options: {
          failOnError: false // defaults to true
        }
      },
      client: {
        src: [
          'public/js/**/*.js'
        ],
        exclude: [
          'public/js/vendor/**/*.js',
          'public/js/require.js'
        ],
        directives: {
          browser: true,
          predef: [
            'jQuery'
          ],
          indent: 2,
          ass: true,
          plusplus: true,
          todo: true,
          predef: [
            'require',
            'define',
            'jQuery',
            '$',
            'alert',
            'console'
            ]
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // enable git-deploy plugin
  grunt.loadNpmTasks('grunt-git-deploy');
  // more
  grunt.loadNpmTasks('grunt-css');
  //grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-htmlcompressor');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-minjson');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-jslint');
  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  //grunt.registerTask('build', 'shell:createBuild cssmin min htmlcompressor');
  grunt.registerTask('publish', 'git_deploy');
  grunt.registerTask('build', ['jslint', 'uglify:library', 'minjson', 'htmlcompressor', 'cssmin', 'min', 'requirejs', 'shell:copyArtifacts']);
  grunt.registerTask('build-debug', ['jslint', 'uglify:library', 'minjson', 'htmlcompressor', 'cssmin', 'min', 'requirejs', 'uglify:client-debug', 'shell:copyArtifacts']);
  grunt.registerTask('clean', ['shell:clean']);
  grunt.registerTask('clean-all', ['shell:clean', 'shell:clean-all']);
  grunt.registerTask('test', ['material_info']);
  grunt.registerTask('debug', ['shell:stop', 'shell:start-debug', 'shell:start-debugger']);
  //grunt.registerTask('release', 'shell:publish')
};
